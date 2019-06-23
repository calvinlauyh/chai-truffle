import "mocha";
import { expect } from "chai";
import "../typings/truffle";

interface BankContractInstance extends Truffle.ContractInstance {
  deposit: Truffle.ContractFunction<() => Promise<void>>;
  balance: Truffle.ContractFunction<
    (account: Truffle.Account) => Promise<BigNumber>
  >;
}
type BankContract = Truffle.Contract<BankContractInstance>;

const Bank: BankContract = artifacts.require("../../test/contracts/Bank");

contract("Bank", accounts => {
  let bankInstance: any;
  beforeEach(async () => {
    bankInstance = await Bank.new();
  });

  describe("Deposit Ether", () => {
    describe("deposit()", () => {
      depositTestSuite(depositOneEtherToContract);
    });

    describe("Transfer Ether to contract", () => {
      depositTestSuite(transferOneEtherToContract);
    });

    function depositTestSuite(
      transferOneEtherFn: (
        contractInstance: BankContractInstance,
      ) => Promise<Truffle.TransactionResponse>,
    ) {
      it("should update user balance to Ether deposit amount when user for the first time transfer Ether to the contract", async () => {
        await expectContractAccountBalanceToEq(bankInstance, "0");

        const receipt = await transferOneEtherFn(bankInstance);
        console.log("receipt", receipt);
        // console.log("receipt.logs", receipt.logs);
        console.log("receipt.receipt", receipt.receipt);
        // console.log("receipt.receipt.logs", receipt.receipt.logs[0].args);
        // console.log("receipt.receipt.rawLogs", receipt.receipt.rawLogs);
        // console.log(await web3.eth.getPastLogs({
        //     fromBlock: 0,
        //     toBlock: receipt.blockNumber,
        //     // address: receipt.from,
        //     topics: [web3.utils.keccak256("Deposit(address,address,uint256)")]
        // }));

        const oneEtherInWei = web3.utils.toWei("1", "wei");
        await expectContractAccountBalanceToEq(bankInstance, oneEtherInWei);
      });

      it("should add the Ether deposit amount to user balance when user transfer Ether to contract", async () => {
        await transferOneEtherFn(bankInstance);
        const oneEtherInWei = web3.utils.toWei("1", "wei");
        await expectContractAccountBalanceToEq(bankInstance, oneEtherInWei);

        await transferOneEtherFn(bankInstance);
        const twoEtherInWei = web3.utils.toWei("2", "wei");
        await expectContractAccountBalanceToEq(bankInstance, twoEtherInWei);
      });
    }

    function transferOneEtherToContract(
      contractInstance: BankContractInstance,
    ): Promise<Truffle.TransactionResponse> {
      const account = accounts[0];
      const oneEtherInWei = web3.utils.toWei("1", "wei");
      return contractInstance.sendTransaction({
        from: account,
        value: oneEtherInWei,
      });
    }

    function depositOneEtherToContract(
      contractInstance: BankContractInstance,
    ): Promise<Truffle.TransactionResponse> {
      const account = accounts[0];
      const oneEtherInWei = web3.utils.toWei("1", "wei");
      return contractInstance.deposit({
        from: account,
        value: oneEtherInWei,
      });
    }

    async function expectContractAccountBalanceToEq(
      contractInstance: BankContractInstance,
      expectedBalance: string,
    ) {
      const account = accounts[0];
      const balance = await contractInstance.balance.call(account);

      expect(balance.toString(10)).to.eq(expectedBalance);
    }
  });
});
