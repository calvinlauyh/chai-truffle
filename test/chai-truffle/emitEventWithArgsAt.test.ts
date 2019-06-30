import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.emitEventWithArgsAt", () => {
  it("should not pass when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").not.to.emitEventWithArgsAt(
        "TestEvent",
        () => true,
        0,
      );
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).not.to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).not.to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  context("Given multiple events are emitted from transaction", () => {
    let response: Truffle.TransactionResponse;
    beforeEach(async () => {
      const contractInstance = await TestContract.new();
      response = await contractInstance.emitTwoMessageEvents("Hello", "World");
    });

    // tslint:disable-next-line:max-line-length
    it("should not pass when the call has emitted the exact matching event at target position", async () => {
      expect(() => {
        expect(response).not.to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "World";
          },
          1,
        );
      }).to.throw(
        "expected transaction not to emit event MessageEvent at position 1 with argument(s) matching assert function, but was emitted",
      );
    });

    it("should pass when the call emit different event at target position", () => {
      expect(response).not.to.emitEventWithArgsAt(
        "TestEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.purpose === "Testing";
        },
        1,
      );
    });

    // tslint:disable-next-line:max-line-length
    it("should pass when the call emit the same event but with arguments not matching assert function at target position", () => {
      expect(response).not.to.emitEventWithArgsAt(
        "MessageEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Call me maybe?";
        },
        1,
      );
    });

    it("should pass when asserting event at out of bounded position", () => {
      expect(response).not.to.emitEventWithArgsAt(
        "MessageEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Call me maybe?";
        },
        10,
      );
    });

    it("should pass when the call emit the exact matching event but at different position", () => {
      expect(response).not.to.emitEventWithArgsAt(
        "MessageEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Hello";
        },
        1,
      );
    });
  });
});

describe(".emitEventWithArgsAt", () => {
  it("should not pass when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should not pass when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  context("Given multiple events are emitted from transaction", () => {
    let response: Truffle.TransactionResponse;
    beforeEach(async () => {
      const contractInstance = await TestContract.new();
      response = await contractInstance.emitTwoMessageEvents("Hello", "World");
    });

    it("should not pass when trying to assert events at out of position", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Hello";
          },
          10,
        );
      }).to.throw(
        `expected transaction to emit event MessageEvent at position 10, but only 2 event(s) are emitted`,
      );
    });

    it("should not pass when the call emits the exact matching event but at different position", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Hello";
          },
          1,
        );
      }).to.throw(
        "expected transaction to emit event MessageEvent at position 1 with argument(s) matching assert function, but was not emitted",
      );
    });

    it("should not pass when the call emits a different event at target position", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "TestEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.purpose === "Testing";
          },
          1,
        );
      }).to.throw(
        "expected transaction to emit event TestEvent at position 1 with argument(s) matching assert function, but was not emitted",
      );
    });

    // tslint:disable-next-line:max-line-length
    it("should not pass when the call emits the same event but with arguments not matching assert function at target position", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Call me maybe?";
          },
          1,
        );
      }).to.throw(
        "expected transaction to emit event MessageEvent at position 1 with argument(s) matching assert function, but was not emitted",
      );
    });

    // tslint:disable-next-line:max-line-length
    it("should pass when the call emits the exact matching event at target position", async () => {
      expect(response).to.emitEventWithArgsAt(
        "MessageEvent",
        (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "World";
        },
        1,
      );
    });
  });
});
