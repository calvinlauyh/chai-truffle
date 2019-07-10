import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.emitEventAt()", () => {
  it("should fail when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").not.to.emitEventAt("TestEvent", 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).not.to.emitEventAt("TestEvent", 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).not.to.emitEventAt("TestEvent", 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call has emitted the name-matched event at position", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(() => {
      expect(response).not.to.emitEventAt("TestEvent", 0);
    }).to.throw(
      "expected transaction not to emit event 'TestEvent' at position 0, but was emitted",
    );
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(() => {
      expect(response).not.to.emitEventAt(
        "TestEvent",
        0,
        "Custom error message",
      );
    }).to.throw(
      "Custom error message: expected transaction not to emit event 'TestEvent' at position 0, but was emitted",
    );
  });

  it("should pass when the call has emitted the name-matched event but not at the position", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitDefaultMessageAndTestEvents();

    expect(response).not.to.emitEventAt("TestEvent", 0);
  });

  it("should pass when the call has not emitted any event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(response).not.to.emitEventAt("TestEvent", 0);
  });

  it("should pass when the call has not emitted the name-matched event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(response).not.to.emitEventAt("TestEvent", 0);
  });
});

describe(".emitEventAt()", () => {
  it("should fail when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").to.emitEventAt("TestEvent", 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).to.emitEventAt("TestEvent", 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).to.emitEventAt("TestEvent", 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call has emitted the name-matched event but not at position", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitDefaultMessageAndTestEvents();

    expect(() => {
      expect(response).to.emitEventAt("TestEvent", 0);
    }).to.throw(
      "expected transaction to emit event 'TestEvent' at position 0, but 'MessageEvent' was emitted",
    );
  });

  it("should fail when the call has not emitted the name-matched event at the position", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).to.emitEventAt("TestEvent", 0);
    }).to.throw(
      "expected transaction to emit event 'TestEvent' at position 0, but 'MessageEvent' was emitted",
    );
  });

  it("should fail when the call has not emitted any event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response).to.emitEventAt("TestEvent", 0);
    }).to.throw(
      "expected transaction to emit event 'TestEvent' at position 0, but only 0 event(s) was emitted",
    );
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response).to.emitEventAt("TestEvent", 0, "Custom error message");
    }).to.throw(
      "Custom error message: expected transaction to emit event 'TestEvent' at position 0, but only 0 event(s) was emitted",
    );
  });

  it("should pass when the call has emitted the name-matched event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(response).to.emitEventAt("TestEvent", 0);
  });
});
