import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.emitEventWithArgsAt", () => {
  it("should fail when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").not.to.emitEventWithArgsAt(
        "TestEvent",
        () => true,
        0,
      );
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).not.to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).not.to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  context("Given multiple MessageEvents are emitted from transaction", () => {
    let response: Truffle.TransactionResponse;
    beforeEach(async () => {
      const contractInstance = await TestContract.new();
      response = await contractInstance.emitTwoMessageEvents("Hello", "World");
    });

    it("should fail when the call has emitted the exact matching event at target position", async () => {
      expect(() => {
        expect(response).not.to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "World";
          },
          1,
        );
      }).to.throw(
        "expected transaction not to emit event 'MessageEvent' at position 1 with matching argument(s), but was emitted",
      );
    });

    it("should support custom error message", async () => {
      expect(() => {
        expect(response).not.to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "World";
          },
          1,
          "Custom error message",
        );
      }).to.throw(
        "Custom error message: expected transaction not to emit event 'MessageEvent' at position 1 with matching argument(s), but was emitted",
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
    it("should pass when the call emit name-matched event but with mismatched arguments at target position", () => {
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
  it("should fail when provided value is not TransactionResponse", async () => {
    expect(() => {
      expect("Hello World").to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is reading a state", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.eventId();

    expect(() => {
      expect(response).to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call is calling a view function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.nextEventId();

    expect(() => {
      expect(response).to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw("to be a Truffle TransactionResponse");
  });

  it("should fail when the call does not emit the name-matched event as position", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).to.emitEventWithArgsAt("TestEvent", () => true, 0);
    }).to.throw(
      "expected transaction to emit event 'TestEvent' at position 0 with matching argument(s), but was not emitted",
    );
  });

  context("Given multiple MessageEvents are emitted from transaction", () => {
    let response: Truffle.TransactionResponse;
    beforeEach(async () => {
      const contractInstance = await TestContract.new();
      response = await contractInstance.emitTwoMessageEvents("Hello", "World");
    });

    it("should fail when asserting event at out of bounded position", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Hello";
          },
          10,
        );
      }).to.throw(
        `expected transaction to emit event 'MessageEvent' at position 10, but only 2 event(s) are emitted`,
      );
    });

    it("should fail when the call emits the exact matching event but at different position", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "MessageEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Hello";
          },
          1,
        );
      }).to.throw(
        "expected transaction to emit event 'MessageEvent' at position 1 with matching argument(s), but argument(s) do not match",
      );
    });

    it("should fail when the call emits a different event at target position", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "TestEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.purpose === "Testing";
          },
          1,
        );
      }).to.throw(
        "expected transaction to emit event 'TestEvent' at position 1 with matching argument(s), but was not emitted",
      );
    });

    it("should support custom error message", () => {
      expect(() => {
        expect(response).to.emitEventWithArgsAt(
          "TestEvent",
          (args: Truffle.TransactionLogArgs): boolean => {
            return args.purpose === "Testing";
          },
          1,
          "Custom error message",
        );
      }).to.throw(
        "Custom error message: expected transaction to emit event 'TestEvent' at position 1 with matching argument(s), but was not emitted",
      );
    });

    context(
      "Call emits name-matched event but with mismatched arguments",
      () => {
        // tslint:disable-next-line:max-line-length
        it("should fail when arguments assert function return false", () => {
          expect(() => {
            expect(response).to.emitEventWithArgsAt(
              "MessageEvent",
              (args: Truffle.TransactionLogArgs): boolean => {
                return args.message === "Call me maybe?";
              },
              1,
            );
          }).to.throw(
            "expected transaction to emit event 'MessageEvent' at position 1 with matching argument(s), but argument(s) do not match",
          );
        });

        it("should fail with thrown Error message when arguments assert function throws Error", () => {
          expect(() => {
            expect(response).to.emitEventWithArgsAt(
              "MessageEvent",
              () => {
                throw new Error("Arguments not match");
              },
              1,
            );
          }).to.throw(
            "expected transaction to emit event 'MessageEvent' at position 1 with matching argument(s), but argument(s) assert function got: 'Arguments not match'",
          );
        });

        // tslint:disable-next-line:max-line-length
        it("should fail with AssertionError with expected and actual values when arguments assert function throws AssertionError", async () => {
          try {
            expect(response).emitEventWithArgsAt(
              "MessageEvent",
              (): boolean => {
                expect("Hello").to.eq("World");
                return false;
              },
              1,
            );
          } catch (err) {
            expect(err).to.be.instanceOf(chai.AssertionError);
            expect(err.message).to.eq(
              "expected transaction to emit event 'MessageEvent' at position 1 with matching argument(s), but argument(s) assert function got: 'expected 'Hello' to equal 'World''",
            );
            expect(err.expected).to.eq("World");
            expect(err.actual).to.eq("Hello");

            return;
          }

          throw new Error("Should thrown Error");
        });
      },
    );

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
