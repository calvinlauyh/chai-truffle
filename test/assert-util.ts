import { expect } from "chai";
import { isNil } from "../lib/utils";

export const assertPromiseShouldReject = async (
  promise: any,
  expectedErrorMessage?: string,
) => {
  try {
    await promise;
  } catch (err) {
    if (!isNil(expectedErrorMessage)) {
      expect(err.message).be.have.string(expectedErrorMessage as string);
    }
    return;
  }
  throw new Error("Should throw Error");
};
