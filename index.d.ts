/// <reference types="chai" />

import { TrufflePolyfill } from "./typings/truffle-polyfill";

declare global {
  namespace Chai {
    interface Assertion
      extends LanguageChains,
        NumericComparison,
        TypeComparison {
      emitEvent(eventName?: string, message?: string): Assertion;
      emitEventAt(eventName: string, position: number, message?: string): Assertion;
      emitEventWithArgs(
        eventName: string,
        assertArgsFn: (args: TrufflePolyfill.TransactionLogArgs) => boolean,
        message?: string,
      ): Assertion;
      emitEventWithArgsAt(
        eventName: string,
        assertArgsFn: (args: TrufflePolyfill.TransactionLogArgs) => boolean,
        position: number,
        message?: string,
      ): Assertion;
      eventLength(expectedLength: number, message?: string): Assertion;
      eventLengthOf(expectedLength: number, message?: string): Assertion;
      evmFail(errorMessage?: string, message?: string): Assertion;
      evmInvalidOpcode(message?: string): Assertion;
      evmOutOfGas(message?: string): Assertion;
      evmRevert(message?: string): Assertion;
      evmSuccess(message?: string): Assertion;
      transactionResponse: Assertion;
      withEventArgs(
        assertArgsFn: (args: TrufflePolyfill.TransactionLogArgs, message?: string) => boolean,
      ): Assertion;
    }

    interface Assert {
      emitEvent<T>(val: T, eventName?: string, message?: string): void;
      emitEventAt<T>(val: T, eventName: string, position: number, message?: string): void;
      emitEventWithArgs<T>(
        val: T,
        eventName: string,
        assertArgsFn: (args: TrufflePolyfill.TransactionLogArgs) => boolean,
        message?: string,
      ): void;
      emitEventWithArgsAt<T>(
        val: T,
        eventName: string,
        assertArgsFn: (args: TrufflePolyfill.TransactionLogArgs) => boolean,
        position: number,
        message?: string,
      ): void;
      eventLength<T>(val: T, expectedLength: number, message?: string): void;
      eventLengthOf<T>(val: T, expectedLength: number, message?: string): void;
      evmFail<T>(val: T, errorMessage?: string, message?: string): void;
      evmInvalidOpcode<T>(val: T, message?: string): void;
      evmOutOfGas<T>(val: T, message?: string): void;
      evmRevert<T>(val: T, message?: string): void;
      evmSuccess<T>(val: T, message?: string): void;
      withEventArgs<T>(
        val: T,
        assertArgsFn: (args: TrufflePolyfill.TransactionLogArgs) => boolean,
        message?: string,
      ): void;
    }
  }
}

declare function chaiTruffle(chai: any, utils: any): void;
export = chaiTruffle;
