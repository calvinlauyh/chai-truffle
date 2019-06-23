import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe("not.withEventArgs", () => {
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
        .but.not.withEventArgs(() => true);
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
      "expect(...).not.to.emitEvent(...).withEventArgs(...) pattern is not support. If you are asserting a transaction has emitted an event but not with the certain argument format, consider using expect(...).to.emitEvent(...).but.not.withEventArgs(...) instead",
    );
  });

  context("Given transaction has emitted target event", () => {
    it("should not pass when event arguments assertion function return true", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response)
          .to.emitEvent("MessageEvent")
          .but.not.withEventArgs(
            (args: Truffle.TransactionLogArgs): boolean => {
              return args.message === "Hello World";
            },
          );
      }).to.throw(
        "expected transaction to emit event MessageEvent but not with argument(s) matching assert function, but argument(s) match",
      );
    });

    it("should pass when event arguments assertion function return false", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(response)
        .to.emitEvent("MessageEvent")
        .but.not.withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Foo Bar Baz";
        });
    });
  });
});

describe("withEventArgs", () => {
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

  context("Given transaction has emitted target event", () => {
    it("should not pass when event arguments assertion function return false", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(() => {
        expect(response)
          .to.emitEvent("MessageEvent")
          .withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
            return args.message === "Foo Bar Baz";
          });
      }).to.throw(
        "expected transaction to emit event MessageEvent with argument(s) matching assert function, but argument(s) do not match",
      );
    });

    it("should pass when event arguments assertion function return true", async () => {
      const contractInstance = await TestContract.new();
      const response = await contractInstance.emitMessageEvent("Hello World");

      expect(response)
        .to.emitEvent("MessageEvent")
        .withEventArgs((args: Truffle.TransactionLogArgs): boolean => {
          return args.message === "Hello World";
        });
    });
  });

  expect;
});
