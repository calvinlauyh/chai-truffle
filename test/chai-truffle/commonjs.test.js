/// <reference types="../../index" />

const chai = require("chai");
const { expect } = chai;

const chaiTrufflePath = "../../lib/chai-truffle";
describe("CommonJS", () => {
  it("should support import", () => {
    const chaiTruffle = require(chaiTrufflePath);

    expect(chaiTruffle).to.be.a("function");
  });

  it("should work", () => {
    const chaiTruffle = require(chaiTrufflePath);

    expect(() => {
      chai.use(chaiTruffle);
    }).not.to.throw();
  });
});
