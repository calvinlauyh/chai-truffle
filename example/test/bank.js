const chai = require("chai");
const chaiTruffle = require("../../build/lib/chai-truffle.js");
const BigNumber = require("bignumber.js");
chai.use(chaiTruffle);

const expect = chai.expect;

const Bank = artifacts.require("Bank");
const oneEtherInWei = web3.utils.toWei("1", "ether");
const twoEtherInWei = web3.utils.toWei("2", "ether");

contract("Bank", (accounts) => {
  let bankInstance;
  let defaultAccount;
  beforeEach(async () => {
    bankInstance = await Bank.new();
    defaultAccount = accounts[0];
  });

  describe("deposit()", () => {
    it("should update user balance to Ether deposit amount when user for the first time transfer Ether to the contract", async () => {
      await expectContractAccountBalanceToEq(bankInstance, "0");

      await depositOneEtherToBank(bankInstance);

      await expectContractAccountBalanceToEq(bankInstance, oneEtherInWei);
    });

    it("should add the Ether deposit amount to user balance when user transfer Ether to contract", async () => {
      await depositOneEtherToBank(bankInstance);
      await expectContractAccountBalanceToEq(bankInstance, oneEtherInWei);

      await depositOneEtherToBank(bankInstance);
      await expectContractAccountBalanceToEq(bankInstance, twoEtherInWei);
    });

    it("should emit Deposit event with sender, token address as 0 and deposit amount", async () => {
      const response = await depositOneEtherToBank(bankInstance);

      expect(response)
        .to.emitEvent("Deposit")
        .withEventArgs((args) => {
          expect(args.from).to.eq(defaultAccount);
          expect(args.amount.toString(10)).to.eq(oneEtherInWei);

          return true;
        });
    });
  });

  describe("withdraw()", () => {
    it("should revert when user without any deposit before tries to withdraw", () => {
      return expect(withdrawOneEtherFromBank(bankInstance)).to.evmRevert();
    });

    it("should revert when trying to withdraw more than user balance", async () => {
      await depositOneEtherToBank(bankInstance);

      return expect(
        withdrawWeiFromBank(bankInstance, twoEtherInWei),
      ).to.evmRevert();
    });

    it("should deduct withdrawal amount from balance", async () => {
      await depositWeiToBank(bankInstance, twoEtherInWei);
      await expectContractAccountBalanceToEq(bankInstance, twoEtherInWei);

      await withdrawOneEtherFromBank(bankInstance);
      await expectContractAccountBalanceToEq(bankInstance, oneEtherInWei);
    });

    it("should transfer the withdrawal amount to sender", async () => {
      await depositWeiToBank(bankInstance, twoEtherInWei);

      const balanceBeforeWithdrawal = await web3.eth.getBalance(defaultAccount);

      await withdrawOneEtherFromBank(bankInstance);

      const balanceAfterWithdrawal = await web3.eth.getBalance(defaultAccount);
      const expectedBalanceAfterWithdrawal = new BigNumber(
        balanceBeforeWithdrawal,
      ).plus(oneEtherInWei);
      expect(balanceAfterWithdrawal).to.eq(
        expectedBalanceAfterWithdrawal.toString(10),
      );
    });

    it("should emit Withdrawal event on successful withdrawal", async () => {
      await depositWeiToBank(bankInstance, twoEtherInWei);

      const response = await withdrawOneEtherFromBank(bankInstance);

      expect(response)
        .to.emitEvent("Withdrawal")
        .withEventArgs((args) => {
          expect(args.to).to.eq(defaultAccount);
          expect(args.amount.toString(10)).to.eq(oneEtherInWei);

          return true;
        });
    });
  });

  function depositOneEtherToBank(bankInstance) {
    return depositWeiToBank(bankInstance, oneEtherInWei);
  }

  function depositWeiToBank(bankInstance, wei) {
    return bankInstance.deposit({
      from: defaultAccount,
      value: wei,
      gasPrice: 0,
    });
  }

  function withdrawOneEtherFromBank(bankInstance) {
    return withdrawWeiFromBank(bankInstance, oneEtherInWei);
  }

  function withdrawWeiFromBank(bankInstance, wei) {
    return bankInstance.withdraw(wei, {
      gasPrice: 0,
    });
  }

  async function expectContractAccountBalanceToEq(
    bankInstance,
    expectedBalance,
  ) {
    const balance = await bankInstance.balance.call(defaultAccount);

    expect(balance.toString(10)).to.eq(expectedBalance);
  }
});
