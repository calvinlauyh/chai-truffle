import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";
import { assertPromiseShouldReject } from "../assert-util";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.evmSuccess()", () => {
  it("should fail when the object is not a promise", () => {
    expect(() => {
      expect("Hello world").not.to.evmSuccess();
    }).to.throw("expected 'Hello world' to be a Promise");
  });

  it("should fail when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.doNothing()).not.to.evmSuccess(),
      "expected transaction to fail in EVM, but it succeeded",
    );
  });

  it("should pass when the call has missing argument", async () => {
    const contractInstance = await TestContract.new();
    return expect(contractInstance.emitMessageEvent()).not.to.evmSuccess();
  });

  it("should pass when the call fails in EVM", async () => {
    const contractInstance = await TestContract.new();
    return expect(
      contractInstance.drainGas({
        gas: 30000,
      }),
    ).not.to.evmSuccess();
  });
});

describe(".evmSuccess()", () => {
  it("should fail when the object is not a promise", () => {
    expect(() => {
      expect("Hello world").to.evmSuccess();
    }).to.throw("expected 'Hello world' to be a Promise");
  });

  it("should fail when the call runs out of gas in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(
        contractInstance.drainGas({
          gas: 30000,
        }),
      ).to.evmSuccess(),
      "expected transaction to succeed in EVM, but it failed",
    );
  });

  it("should fail when the call gets reverted in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.revertImmediately()).to.evmSuccess(),
      "expected transaction to succeed in EVM, but it failed",
    );
  });

  it("should fail when the call has missing argument", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.emitMessageEvent()).to.evmSuccess(),
      "expected transaction to succeed in EVM, but it failed",
    );
  });

  it("should fail when the promise resolve to non-transaction response", async () => {
    return assertPromiseShouldReject(
      expect(Promise.resolve("Hello world")).to.evmSuccess(),
      "expected 'Hello world' to be a Truffle TransactionResponse",
    );
  });

  it("should pass when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();

    expect(contractInstance.doNothing()).to.evmSuccess();
  });
});
