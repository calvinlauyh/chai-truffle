declare type TestContract = Truffle.Contract<TestContractInstance>;
declare interface TestContractInstance extends Truffle.ContractInstance {
  eventId: Truffle.ContractState<BN>;
  emitDefaultMessageAndTestEvents: Truffle.ContractFunction<
    () => Promise<void>
  >;
  emitDefaultMessageEvent: Truffle.ContractFunction<() => Promise<void>>;
  emitTwoMessageEvents: Truffle.ContractFunction<
    (firstMessage: string, secondMessage: string) => Promise<void>
  >;
  emitMessageEvent: Truffle.ContractFunction<
    (message: string) => Promise<void>
  >;
  emitTestEvent: Truffle.ContractFunction<() => Promise<void>>;
  doNothing: Truffle.ContractFunction<() => Promise<void>>;
  drainGas: Truffle.ContractFunction<() => Promise<void>>;
  assertImmediately: Truffle.ContractFunction<() => Promise<void>>;
  revertImmediately: Truffle.ContractFunction<() => Promise<void>>;
  nextEventId: Truffle.ContractFunction<() => Promise<BN>>;
}
