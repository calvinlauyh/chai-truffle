import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.have.eventEmitted", () => {
  it("should not pass when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").not.to.have.eventEmitted;
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).not.to.have.eventEmitted;
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).not.to.have.eventEmitted;
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when transaction has emitted at least one event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(() => {
      expect(response).not.to.have.eventEmitted;
    }).to.throw(
      "expected transaction not to emit event, but event TestEvent was emitted",
    );
  });

  it("should pass when transaction has not emitted any event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(response).not.to.have.eventEmitted;
  });
});

describe(".have.eventEmitted", () => {
  it("should not pass when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").to.have.eventEmitted;
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).to.have.eventEmitted;
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).to.have.eventEmitted;
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when transaction has not emitted any event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response).to.have.eventEmitted;
    }).to.throw("expected transaction to emit event, but none was emitted");
  });

  it("should pass when transaction has emitted an event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(response).to.have.eventEmitted;
  });

  it("should pass when transaction has emitted multiple events", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitDefaultMessageAndTestEvents();

    expect(response).to.have.eventEmitted;
  });
});
