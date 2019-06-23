import chai, { expect } from "chai";
import chaiTruffle from "../../lib/chai-truffle";

const TestContract: TestContract = artifacts.require("Test");

chai.use(chaiTruffle);

describe(".not.transactionResponse", () => {
  it("should pass for primitive types", () => {
    expect("Hello World").not.to.be.transactionResponse;
    expect(1000).not.to.be.transactionResponse;
    expect(null).not.to.be.transactionResponse;
    expect({}).not.to.be.transactionResponse;
  });

  it("should pass for partially similar objects", () => {
    expect({
      tx: null,
    }).not.to.be.transactionResponse;
    expect({
      receipt: null,
    }).not.to.be.transactionResponse;
    expect({
      logs: [],
    }).not.to.be.transactionResponse;
  });
});

describe(".transactionResponse", () => {
  it("should pass for TransactionResponse", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();

    expect(response).to.be.transactionResponse;
  });

  it("should pass for TransactionResponse", async () => {
    const contractInstance = await TestContract.new();
    const response = await contractInstance.doNothing();
    (response as any).status = true;

    expect(response).to.be.transactionResponse;
  });
});
