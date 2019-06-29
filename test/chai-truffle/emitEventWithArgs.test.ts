import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.emitEventWithArgs", () => {
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
      "expected transaction not to emit event MessageEvent with argument(s) matching assert function, but was emitted",
    );
  });

  context("Given multiple events are emitted", () => {
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
        "expected transaction not to emit event MessageEvent with argument(s) matching assert function, but was emitted",
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

describe(".emitEventWithArgs", () => {
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

  // tslint:disable-next-line:max-line-length
  it("should not pass when the call has emitted the same event but with arguments not matching assert function", async () => {
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
      "expected transaction to emit event MessageEvent with argument(s) matching assert function, but was not emitted",
    );
  });

  it("should not pass when the call has not emitted the exact matching event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw(
      "expected transaction to emit event TestEvent with argument(s) matching assert function, but was not emitted",
    );
  });

  it("should pass when the call has emitted the exact matching event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(response).to.emitEventWithArgs(
      "MessageEvent",
      (args: Truffle.TransactionLogArgs): boolean => {
        return args.message === "Hello World";
      },
    );
  });

  context("Given multiple events are emitted", () => {
    it("should not pass when all the same-named events fail arguments assert function", async () => {
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
        "expected transaction to emit event MessageEvent with argument(s) matching assert function, but was not emitted",
      );
    });

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
