import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe.only("not.withEventArgs", () => {
  it("should not pass when the assertion does not call emitEvent before", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response).not.to.be.withEventArgs(() => true);
    }).to.throw(
      "to assert event arguments the assertion must be asserted with emitEvent() or emitEventAt() first. i.e. expect(...).to.emitEvent(...).withEventArgs(...)",
    );
  });

  it("should not pass when emitEvent fails", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response)
        .to.emitEvent("TestEvent")
        .not.withEventArgs(() => true);
    }).to.throw(
      "expected transaction to emit event TestEvent, but was not emitted",
    );
  });

  it("should not pass when not was called before emitEvent", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitTestEvent();

    expect(() => {
      expect(response)
        .not.to.emitEvent("MessageEvent")
        .withEventArgs(() => true);
    }).to.throw(
      "expect(...).not.to.emitEvent(...).withEventArgs(...) pattern is not support. If you are asserting a transaction has emitted an event but not with the certain argument format, consider using expect(...).to.emitEvent(...).not.withEventArgs(...) instead",
    );
  });

  // tslint:disable-next-line:max-line-length
  it("should not pass when the call emits the exact matching event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(() => {
      expect(response)
        .to.emitEvent("MessageEvent")
        .not.withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Hello World";
        });
    }).to.throw(
      "expected transaction to emit event MessageEvent but not with matching argument(s), but argument(s) match",
    );
  });

  it("should pass when the call emits the same event but with arguments not matching assert function", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(response)
      .to.emitEvent("MessageEvent")
      .not.withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
        return args.message === "Call me maybe?";
      });
  });

  context("Given multiple events are emitted from transaction", () => {
    // tslint:disable-next-line:max-line-length
    it("should not pass when the first name-matched event fails argument assert function, but the second one passes", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTwoMessageEvents(
        "Hello",
        "World",
      );

      expect(() => {
        expect(response)
          .to.emitEvent("MessageEvent")
          .not.withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "World";
          });
      }).to.throw(
        "expected transaction to emit event MessageEvent but not with matching argument(s), but argument(s) match",
      );
    });

    it("should pass when all the same-named events fail arguments assert function", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTwoMessageEvents(
        "Hello",
        "World",
      );

      expect(response)
        .to.emitEvent("MessageEvent")
        .not.withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Call me maybe?";
        });
    });
  });
});

describe.only("withEventArgs", () => {
  it("should not pass when the assertion does not call emitEvent before", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response).to.be.withEventArgs(() => true);
    }).to.throw(
      "to assert event arguments the assertion must be asserted with emitEvent() or emitEventAt() first. i.e. expect(...).to.emitEvent(...).withEventArgs(...)",
    );
  });

  it("should not pass when emitEvent fails", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(() => {
      expect(response)
        .to.emitEvent("TestEvent")
        .withEventArgs(() => true);
    }).to.throw(
      "expected transaction to emit event TestEvent, but was not emitted",
    );
  });

  context("Call emits same event but with mismatched arguments", () => {
    it("should not pass when arguments not matching assert function", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response)
          .to.emitEvent("MessageEvent")
          .withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Call me maybe?";
          });
      }).to.throw(
        "expected transaction to emit event MessageEvent with matching argument(s), but argument(s) do not match",
      );
    });

    it("should not pass with thrown error message when arguments assert function throws Error", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response)
          .to.emitEvent("MessageEvent")
          .withEventArgs(() => {
            throw new Error("Arguments does not match");
          });
      }).to.throw(
        "expected transaction to emit event MessageEvent with matching argument(s), but argument(s) assert function got: Arguments does not match",
      );
    });

    // tslint:disable-next-line:max-line-length
    it("should not pass with AssertionError with expected and actual values when arguments assert function throws AssertionError", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      try {
        expect(response)
          .to.emitEvent("MessageEvent")
          .withEventArgs((): boolean => {
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

  it("should pass when the call emits the exact same event", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.emitMessageEvent("Hello World");

    expect(response)
      .to.emitEvent("MessageEvent")
      .withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
        return args.message === "Hello World";
      });
  });

  context("Given multiple events are emitted from transaction", () => {
    it("should not pass when all the same-named events fail arguments assert function", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitTwoMessageEvents(
        "Hello",
        "World",
      );

      expect(() => {
        expect(response)
          .to.emitEvent("MessageEvent")
          .withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Call me maybe?";
          });
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

      expect(response)
        .to.emitEvent("MessageEvent")
        .withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "I don't know why";
        });
    });
  });
});
