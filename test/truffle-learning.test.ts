import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { TrufflePolyfill } from "../typings/truffle-polyfill";
import { TestContract } from "./TestContract";
chai.use(chaiAsPromised);

const TestContract: TestContract = artifacts.require("Test");

contract("Truffle Learning Test", (accounts: TrufflePolyfill.Account[]) => {
  describe("Error message", () => {
    it("should throw error when transaction is out of gas", async () => {
      const contractInstance = await TestContract.new();

      return expect(
        contractInstance.drainGas({
          gas: 30000,
        }),
      ).to.eventually.rejectedWith(
        "VM Exception while processing transaction: out of gas",
      );
    });

    it("should throw error when transaction is reverted", async () => {
      const contractInstance = await TestContract.new();

      return expect(
        contractInstance.revertImmediately(),
      ).to.eventually.rejectedWith(
        "VM Exception while processing transaction: revert Revert immediately -- Reason given: Revert immediately.",
      );
    });

    it("should throw error when trying to send Ether to non-payable function", async () => {
      const contractInstance = await TestContract.new();
      const oneEtherInWei = web3.utils.toWei("1", "wei");
      return expect(
        contractInstance.doNothing({
          from: accounts[0],
          value: oneEtherInWei,
        }),
      ).to.eventually.rejectedWith(
        "VM Exception while processing transaction: revert",
      );
    });
  });
});
