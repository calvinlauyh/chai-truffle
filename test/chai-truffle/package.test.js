const path = require("path");
const chai = require("chai");
const { expect } = chai;

describe("package.js", () => {
    it("should have correct main path", () => {
        const packageJson = require("../../package.json");
        const chaiTruffle = require(path.resolve("./", packageJson.main)).default;

        expect(chaiTruffle).to.be.a("function");
    });
});
