import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";
import { TestContract } from "../TestContract";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe("not.eventLength", () => {
  it("should fail when provided value is not a TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").not.to.have.eventLength(2);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the length of event log matches the provided length", async () => {
    const contractInstance = await TestContract.new();

    const response = await contractInstance.emitDefaultMessageAndTestEvents();
    expect(() => {
      expect(response).not.to.have.eventLength(2);
    }).to.throw("expected transaction not to emit 2 event log(s)");
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();

    const response = await contractInstance.emitDefaultMessageAndTestEvents();
    expect(() => {
      expect(response).not.to.have.eventLength(2, "Custom error message");
    }).to.throw("Custom error message: expected transaction not to emit 2 event log(s)");
  });

  it("should pass when the length of event log is different from the provided length", async () => {
    const contractInstance = await TestContract.new();

    const response = await contractInstance.emitDefaultMessageAndTestEvents();
    expect(response).not.to.have.eventLength(1);
  });
});

describe("eventLength", () => {
  it("should fail when provided value is not a TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").to.have.eventLength(2);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the length of event log is different from the provided length", async () => {
    const contractInstance = await TestContract.new();

    const response = await contractInstance.emitDefaultMessageAndTestEvents();
    expect(() => {
      expect(response).to.have.eventLength(1);
    }).to.throw(
      "expected transaction to emit 1 event log(s), but 2 was emitted",
    );
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();

    const response = await contractInstance.emitDefaultMessageAndTestEvents();
    expect(() => {
      expect(response).to.have.eventLength(1, "Custom error message");
    }).to.throw(
      "Custom error message: expected transaction to emit 1 event log(s), but 2 was emitted",
    );
  });

  it("should pass when the length of event log matches the provided length", async () => {
    const contractInstance = await TestContract.new();

    const response = await contractInstance.emitDefaultMessageAndTestEvents();
    expect(response).to.have.eventLength(2);
  });
});
