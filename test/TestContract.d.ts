import { TrufflePolyfill } from "../typings/truffle-polyfill";

type BN = import("bn.js");

export type TestContract = TrufflePolyfill.Contract<TestContractInstance>;
export interface TestContractInstance extends TrufflePolyfill.ContractInstance {
  eventId: TrufflePolyfill.ContractState<BN>;
  emitDefaultMessageAndTestEvents: TrufflePolyfill.ContractFunction<
    () => Promise<void>
  >;
  emitDefaultMessageEvent: TrufflePolyfill.ContractFunction<() => Promise<void>>;
  emitTwoMessageEvents: TrufflePolyfill.ContractFunction<
    (firstMessage: string, secondMessage: string) => Promise<void>
  >;
  emitMessageEvent: TrufflePolyfill.ContractFunction<
    (message: string) => Promise<void>
  >;
  emitTestEvent: TrufflePolyfill.ContractFunction<() => Promise<void>>;
  doNothing: TrufflePolyfill.ContractFunction<() => Promise<void>>;
  drainGas: TrufflePolyfill.ContractFunction<() => Promise<void>>;
  assertImmediately: TrufflePolyfill.ContractFunction<() => Promise<void>>;
  revertImmediately: TrufflePolyfill.ContractFunction<() => Promise<void>>;
  nextEventId: TrufflePolyfill.ContractFunction<() => Promise<BN>>;
}
