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

  it("should not pass when the call has emitted the same event with arguments matching assert function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).not.to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
        return args.message === "Hello World";
      });
    }).to.throw(
      "expected transaction not to emit event MessageEvent with argument(s) matching assert function, but was emitted",
    );
  });

  // tslint:disable-next-line:max-line-length
  it("should pass when the call has not emitted the exact same event with arguments matching assert function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(response).not.to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
      return args.message === "Hello World";
    });
  });

  context("Given multiple events are emitted", () => {
    context("When the first name-matched event fails arguments assert function but the second one passes", () => {
      it("should not pass", async () => {
        const contractInstance = await TestContract.new();
        const response = await contractInstance.emitTwoMessageEvents("My code works", "I don't know why");

        expect(() => {
          expect(response).not.to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "I don't know why";
          });
        }).to.throw(
          "expected transaction not to emit event MessageEvent with argument(s) matching assert function, but was emitted",
        );
      });
    });

    context("When all same-named events fail arguments assert function", () => {
      it("should pass", async () => {
        const contractInstance = await TestContract.new();
        const response = await contractInstance.emitTwoMessageEvents("Hello", "World");

        expect(response).not.to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Call me maybe?";
        });
      });
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

  // tslint:disable-next-line:max-line-length
  it("should not pass when the call has emitted the same event but with arguments not matching assert function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
        return args.message === "Call me maybe?";
      });
    }).to.throw(
      "expected transaction to emit event MessageEvent with argument(s) matching assert function, but was not emitted",
    );
  });

  it("should not pass when the call has not emitted the event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response).to.emitEventWithArgs("TestEvent", () => true);
    }).to.throw(
      "expected transaction to emit event TestEvent with argument(s) matching assert function, but was not emitted",
    );
  });

  it("should pass when the call has emitted exactly the same event with arguments", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(response).to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
      return args.message === "Hello World";
    });
  });

  context("Given multiple events are emitted", () => {
    context("When all same-named events fail arguments assert function", () => {
      it("should not pass", async () => {
        const contractInstance = await TestContract.new();
        const response = await contractInstance.emitTwoMessageEvents("Hello", "World");

        expect(() => {
          expect(response).to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Call me maybe?";
          });
        }).to.throw(
          "expected transaction to emit event MessageEvent with argument(s) matching assert function, but was not emitted",
        );
      });
    });

    context("When the first name-matched event fails arguments assert function but the second one passes", () => {
      it("should pass", async () => {
        const contractInstance = await TestContract.new();
        const response = await contractInstance.emitTwoMessageEvents("My code works", "I don't know why");

        expect(response).to.emitEventWithArgs("MessageEvent", (args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "I don't know why";
        });
      });
    });
  });
});
