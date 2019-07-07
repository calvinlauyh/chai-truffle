import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";
import { assertPromiseShouldReject } from "../assert-util";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.evmRevert()", () => {
  it("should pass when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();
    return expect(contractInstance.doNothing()).not.to.evmRevert();
  });

  it("should pass when the call runs out of gas in EVM but not because of getting reverted", async () => {
    const contractInstance = await TestContract.new();
    return expect(
      contractInstance.drainGas({
        gas: 30000,
      }),
    ).not.to.evmRevert();
  });

  it("should fail when the call gets reverted in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.revertImmediately()).not.to.evmRevert(),
      "expected transaction not to fail in EVM because of revert, but it was",
    );
  });
});

describe(".evmRevert()", () => {
  it("should fail when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.doNothing()).to.evmRevert(),
      "expected transaction to fail in EVM because of revert, but it succeeded",
    );
  });

  it("should fail when the call runs out of gas in EVM but not because of getting reverted", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(
        contractInstance.drainGas({
          gas: 30000,
        }),
      ).to.evmRevert(),
      "expected transaction to fail in EVM because of revert, but it failed of another reason",
    );
  });

  it("should pass when the call gets reverted in EVM", async () => {
    const contractInstance = await TestContract.new();
    return expect(contractInstance.revertImmediately()).to.evmRevert();
  });
});
