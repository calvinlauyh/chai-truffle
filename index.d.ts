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
      evmSuccess(): Assertion;
      evmFail(errorMessage?: string): Assertion;
      evmOutOfGas(): Assertion;
      evmRevert(): Assertion;
      transactionResponse: Assertion;
      eventLength(expectedLength: number): Assertion;
      eventLengthOf(expectedLength: number): Assertion;
      eventEmitted: Assertion;
      emitEvent(eventName?: string): Assertion;
      emitEventAt(eventName: string, position: number): Assertion;
      emitEventWithArgs(
        eventName: string,
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
      ): Assertion;
      emitEventWithArgsAt(
        eventName: string,
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
        position: number,
      ): Assertion;
      withEventArgs(
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
      ): Assertion;
    }

    interface Assert {
      evmSuccess<T>(val: T): void;
      evmFail<T>(val: T, errorMessage?: string): void;
      evmOutOfGas<T>(val: T): void;
      evmRevert<T>(val: T): void;
      eventLength<T>(val: T, expectedLength: number): void;
      eventLengthOf<T>(val: T, expectedLength: number): void;
      emitEvent<T>(val: T, eventName?: string): void;
      emitEventAt<T>(val: T, eventName: string, position: number): void;
      emitEventWithArgs<T>(
        val: T,
        eventName: string,
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
      ): void;
      emitEventWithArgsAt<T>(
        val: T,
        eventName: string,
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
        position: number,
      ): void;
      withEventArgs<T>(
        val: T,
        assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
      ): void;
    }
  }
}

declare function chaiTruffle(chai: any, utils: any): void;
export = chaiTruffle;
