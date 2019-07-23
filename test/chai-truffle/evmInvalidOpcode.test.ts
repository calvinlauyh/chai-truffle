import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";
import { assertPromiseShouldReject } from "../assert-util";
import { TestContract } from "../TestContract";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.evmInvalidOpcode()", () => {
  it("should fail when the call gets reverted in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.assertImmediately()).not.to.evmInvalidOpcode(),
      "expected transaction not to fail in EVM because of 'invalid opcode', but it was",
    );
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.assertImmediately()).not.to.evmInvalidOpcode(
        "Custom error message",
      ),
      "Custom error message: expected transaction not to fail in EVM because of 'invalid opcode', but it was",
    );
  });

  it("should pass when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();
    return expect(contractInstance.doNothing()).not.to.evmInvalidOpcode();
  });

  it("should pass when the call runs out of gas in EVM but not because of invalid opcode", async () => {
    const contractInstance = await TestContract.new();
    return expect(
      contractInstance.drainGas({
        gas: 30000,
      }),
    ).not.to.evmInvalidOpcode();
  });
});

describe(".evmInvalidOpcode()", () => {
  it("should fail when the call succeeds in EVM", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.doNothing()).to.evmInvalidOpcode(),
      "expected transaction to fail in EVM because of 'invalid opcode', but it succeeded",
    );
  });

  it("should fail when the call runs out of gas in EVM but not because of invalid opcode", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(
        contractInstance.drainGas({
          gas: 30000,
        }),
      ).to.evmInvalidOpcode(),
      "expected transaction to fail in EVM because of 'invalid opcode', but it failed of another reason:",
    );
  });

  it("should support custom error message", async () => {
    const contractInstance = await TestContract.new();
    return assertPromiseShouldReject(
      expect(contractInstance.doNothing()).to.evmInvalidOpcode(
        "Custom error message",
      ),
      "Custom error message: expected transaction to fail in EVM because of 'invalid opcode', but it succeeded",
    );
  });

  it("should pass when the call gets reverted in EVM", async () => {
    const contractInstance = await TestContract.new();
    return expect(contractInstance.assertImmediately()).to.evmInvalidOpcode();
  });
});
