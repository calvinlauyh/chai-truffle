import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.broadcast", () => {
  it("should not pass when the object is not a promise", () => {
    expect(() => {
      expect("Hello world").not.to.broadcast;
    }).to.throw();
  });

  it("should not pass when the call broadcast successfully", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.doNothing()).not.to.broadcast,
    );
  });

  it("should not pass when the promise resolve to non-transaction response", () => {
    return assertPromiseShouldReject(
      expect(Promise.resolve("Hello world")).not.to.broadcast,
    );
  });

  it("should pass when the call misses argument", async () => {
    const contractInstance = await TestContract.new();
    return expect(
      contractInstance.emitMessageEvent(),
    ).not.to.broadcast;
  });

  it("should pass when the call fail on broadcast", async () => {
    const contractInstance = await TestContract.new();
    return expect(
      contractInstance.doNothing({
        gas: 0,
        gasLimit: 0,
      }),
    ).not.to.broadcast;
  });
});

describe(".broadcast", () => {
  it("should not pass when the object is not a promise", () => {
    expect(() => {
      expect("Hello world").to.broadcast;
    }).to.throw();
  });

  it("should not pass when the call fail on broadcast", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(
        contractInstance.doNothing({
          gas: 0,
          gasLimit: 0,
        }),
      ).to.broadcast,
    );
  });

  it("should not pass when the promise resolve to non-transaction response", () => {
    return assertPromiseShouldReject(
      expect(Promise.resolve("Hello world")).to.broadcast,
    );
  });

  it("should not pass when the call misses argument", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.emitMessageEvent()).to.broadcast,
    );
  });

  it("should pass when the call broadcast successfully", async () => {
    const contractInstance = await TestContract.new();

    expect(contractInstance.doNothing()).to.broadcast;
  });
});

const assertPromiseShouldReject = async (promise: any) => {
  try {
    await promise;
  } catch (error) {
    return;
  }
  throw new Error("Should throw Error");
};
