import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.emitEvent()", () => {
  it("should fail when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).not.to.emitEvent();
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).not.to.emitEvent();
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(() => {
      expect(response).not.to.emitEvent(undefined, "Custom error message");
    }).to.throw("Custom error message");
  });

  it("should pass when the call has not emitted any event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(response).not.to.emitEvent();
  });

  context("Given event name", () => {
    it("should fail when provided value is not TransactionResponse", async () => {
      expect(() => {
        expect("Hello World").not.to.emitEvent("TestEvent");
      }).to.throw("to be a Truffle TransactionResponse");
    });

    it("should fail when the call has emitted the specified event", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTestEvent();

      expect(() => {
        expect(response).not.to.emitEvent("TestEvent");
      }).to.throw(
        "expected transaction not to emit event TestEvent, but was emitted",
      );
    });

    it("should support error message", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTestEvent();

      expect(() => {
        expect(response).not.to.emitEvent("TestEvent", "Custom error message");
      }).to.throw(
        "Custom error message: expected transaction not to emit event TestEvent, but was emitted",
      );
    });

    it("should pass when the call has not emitted the specified event", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(response).not.to.emitEvent("TestEvent");
    });
  });
});

describe(".emitEvent()", () => {
  it("should fail when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").to.emitEvent();
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).to.emitEvent();
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).to.emitEvent();
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response).to.emitEvent(undefined, "Custom error message");
    }).to.throw("Custom error message: expected transaction to emit event, but none was emitted");
  });

  it("should pass when the call has emitted an event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(response).to.emitEvent();
  });

  context("Given event name", () => {
    it("should fail when the call has not emitted the specified event", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response).to.emitEvent("TestEvent");
      }).to.throw(
        "expected transaction to emit event TestEvent, but was not emitted",
      );
    });

    it("should support custom error message", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response).to.emitEvent("TestEvent", "Custom error message");
      }).to.throw(
        "Custom error message: expected transaction to emit event TestEvent, but was not emitted",
      );
    });

    it("should pass when the call has emitted the specified event", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTestEvent();

      expect(response).to.emitEvent("TestEvent");
    });
  });
});
