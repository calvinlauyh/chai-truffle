import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";
import { assertPromiseShouldReject } from "../assert-util";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.evmFail()", () => {
  it("should not pass when the object is not a promise", () => {
    expect(() => {
      expect("Hello world").not.to.evmFail();
    }).to.throw("expected 'Hello world' to be a Promise");
  });

  it("should not pass when the call runs out of gas in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(
        contractInstance.drainGas({
          gas: 30000,
        }),
      ).not.to.evmFail(),
      "expected transaction to succeed in EVM, but it failed",
    );
  });

  it("should not pass when the call get reverted in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.revertImmediately()).not.to.evmFail(),
      "expected transaction to succeed in EVM, but it failed",
    );
  });

  it("should not pass when the promise resolve to non-transaction response", () => {
    return assertPromiseShouldReject(
      expect(Promise.resolve("Hello world")).not.to.evmFail(),
      "expected 'Hello world' to be a Truffle TransactionResponse",
    );
  });

  it("should pass when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();
    return expect(contractInstance.doNothing()).not.to.evmFail();
  });
});

describe(".evmFail()", () => {
  it("should not pass when the object is not a promise", () => {
    expect(() => {
      expect("Hello world").to.evmFail();
    }).to.throw("expected 'Hello world' to be a Promise");
  });

  it("should not pass when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.doNothing()).to.evmFail(),
      "expected transaction to fail in EVM, but it succeeded",
    );
  });

  it("should pass when the call has missing argument", async () => {
    const contractInstance = await TestContract.new();
    return expect(contractInstance.emitMessageEvent()).to.evmFail();
  });

  it("should pass when the call runs out of gas in EVM", async () => {
    const contractInstance = await TestContract.new();

    expect(
      contractInstance.drainGas({
        gas: 30000,
      }),
    ).to.evmFail();
  });

  it("should pass when the call gets reverted in EVM", async () => {
    const contractInstance = await TestContract.new();

    expect(contractInstance.revertImmediately()).to.evmFail();
  });
});
