import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe.only(".not.emitEventWithArgs", () => {
  it("should not pass when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").not.to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).not.to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).not.to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call has emitted the exact matching event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).not.to.emitEventWithArgs(
        "MessageEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Hello World";
        },
      );
    }).to.throw(
      "expected transaction not to emit event MessageEvent with matching argument(s), but was emitted",
    );
  });

  context("Given multiple events are emitted from transaction", () => {
    let response: Truffle.TransactionResponse;
    beforeEach(async () => {
      const contractInstance = await TestContract.new();
      response = await contractInstance.emitTwoMessageEvents(
        "My code works",
        "I don't know why",
      );
    });

    // tslint:disable-next-line:max-line-length
    it("should not pass when the first name-matched event fails arguments assert function but the second one passes", () => {
      expect(() => {
        expect(response).not.to.emitEventWithArgs(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "I don't know why";
          },
        );
      }).to.throw(
        "expected transaction not to emit event MessageEvent with matching argument(s), but was emitted",
      );
    });

    it("should pass when none of the events are exact matching", async () => {
      expect(response).not.to.emitEventWithArgs(
        "MessageEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Call me maybe?";
        },
      );
    });
  });
});

describe.only(".emitEventWithArgs", () => {
  it("should not pass when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  context("Call emits same event but with mismatched arguments", () => {
    it("should not pass when arguments assert function return false", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response).to.emitEventWithArgs(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Call me maybe?";
          },
        );
      }).to.throw(
        "expected transaction to emit event MessageEvent with matching argument(s), but argument(s) do not match",
      );
    });

    it("should not pass with error message when arguments assert function throws Error", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response).to.emitEventWithArgs("MessageEvent", () => {
          throw new Error("Arguments not match");
        });
      }).to.throw(
        "expected transaction to emit event MessageEvent with matching argument(s), but argument(s) assert function got: Arguments not match",
      );
    });

    // tslint:disable-next-line:max-line-length
    it("should not pass with AssertionError with expected and actual values when arguments assert function throws AssertionError", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      try {
        expect(response).emitEventWithArgs("MessageEvent", (): boolean => {
          expect("Hello").to.eq("World");
          return false;
        });
      } catch (err) {
        expect(err).to.be.instanceOf(chai.AssertionError);
        expect(err.message).to.eq(
          "expected transaction to emit event MessageEvent with matching argument(s), but argument(s) assert function got: expected 'Hello' to equal 'World'",
        );
        expect(err.expected).to.eq("World");
        expect(err.actual).to.eq("Hello");

        return;
      }

      throw new Error("Should have thrown an Error");
    });
  });

  it("should not pass when the call does not emit the exact matching event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw(
      "expected transaction to emit event TestEvent with matching argument(s), but was not emitted",
    );
  });

  it("should pass when the call emits the exact matching event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(response).to.emitEventWithArgs(
      "MessageEvent",
      (args: Truffle.TransactionLogArgs): boolean => {
        return args.message === "Hello World";
      },
    );
  });

  context("Given multiple events are emitted from transaction", () => {
    it("should not pass when all the same-named events has arguments assert function return false", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTwoMessageEvents(
        "Hello",
        "World",
      );

      expect(() => {
        expect(response).to.emitEventWithArgs(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Call me maybe?";
          },
        );
      }).to.throw(
        "expected transaction to emit event MessageEvent with matching argument(s), but argument(s) do not match",
      );
    });

    // tslint:disable-next-line:max-line-length
    it("should pass when the first name-matched event fails arguments assert function but the second one passes", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTwoMessageEvents(
        "My code works",
        "I don't know why",
      );

      expect(response).to.emitEventWithArgs(
        "MessageEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "I don't know why";
        },
      );
    });
  });
});
