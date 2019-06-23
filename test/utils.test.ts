import "mocha";
import { expect } from "chai";
import { isNil } from "../lib/utils";

describe("Utils", () => {
    describe("isNil", () => {
        it("should return false for non-Nil types", () => {
            expect(isNil(1000)).to.be.false;
            expect(isNil("Hello World")).to.be.false;
            expect(isNil(NaN)).to.be.false;
        });

        it("should return true for null", () => {
            expect(isNil(null)).to.be.true;
        });

        it("should return true for undefined", () => {
            expect(isNil(undefined)).to.be.true;
        });
    });
});