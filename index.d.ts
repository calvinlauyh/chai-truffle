// Type definitions for chai-arrays 1.0
// Project: https://github.com/GaneshSPatil/chai-arrays
// Definitions by: Clément Prévot <https://github.com/clementprevot>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="chai" />

declare global {
  namespace Chai {
    interface Assertion
      extends LanguageChains,
        NumericComparison,
        TypeComparison {
      emitEvent(eventName?: string): Assertion;
      emitEventAt(eventName: string, position: number): Assertion;
      eventLength(expectedLength: number): Assertion;
      eventLengthOf(expectedLength: number): Assertion;
      evmFail(errorMessage?: string): Assertion;
      evmOutOfGas(): Assertion;
      evmRevert(): Assertion;
      evmSuccess(): Assertion;
      transactionResponse: Assertion;
      withEventArgs(
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
      ): Assertion;
    }

    interface Assert {
      emitEvent<T>(val: T, eventName?: string): void;
      emitEventAt<T>(val: T, eventName: string, position: number): void;
      eventLength<T>(val: T, expectedLength: number): void;
      eventLengthOf<T>(val: T, expectedLength: number): void;
      evmFail<T>(val: T, errorMessage?: string): void;
      evmOutOfGas<T>(val: T): void;
      evmRevert<T>(val: T): void;
      evmSuccess<T>(val: T): void;
      withEventArgs<T>(
        val: T,
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
      ): Assertion;
    }
  }

  interface Array<T> {
    should: Chai.Assertion;
  }
}

declare function chaiTruffle(chai: any, utils: any): void;
export = chaiTruffle;
