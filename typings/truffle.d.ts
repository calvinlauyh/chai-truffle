type BN = import("bn.js");
type BigNumber = import("bignumber.js").BigNumber;
type Web3 = import("web3");
type Web3TransactionReceipt = import("web3/types").TransactionReceipt;
type Web3EthTx = import("web3/eth/types").Tx;
type Web3Log = import("web3/types").Log;

declare const web3: import("web3");

declare function contract(name: string, testSuite: (accounts: Truffle.Account[]) => void): void;
declare const artifacts: Truffle.Artifacts;
declare namespace Truffle {
  export type Account = string;

  export interface TransactionResponse {
    tx: string;
    receipt: TransactionReceipt;
    logs: TransactionLog[];
  }

  export interface TransactionLog {
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    address: string;
    type: string;
    id: string;
    event: string;
    args: TransactionLogArgs;
  }

  interface TransactionLogArgs {
    [nameOrIndex: string]: string | BN | BigNumber;
  }

  export interface Contract<T extends ContractInstance> {
    deployed(): Promise<T>;
    "new"(): Promise<T>;
  }

  export interface ContractInstance {
    sendTransaction: (
      tx?: Web3EthTx,
    ) => Promise<TransactionResponse>;
  }

  export interface TransactionReceipt extends Omit<Web3TransactionReceipt, "logs"> {
    logs: TransactionLog[];
    rawLogs: Web3Log;
  }

  export interface ContractFunction<T extends Function> {
    (...args: Array<any | Web3EthTx[]>): Promise<TransactionResponse>;
    call: T;
  }

  export interface ContractState<T> {
    (...args: any[]): Promise<T>;
    call(...args: any[]): Promise<T>;
  }

  interface Artifacts {
    require<C extends ContractInstance, T extends Contract<C>>(path: string): T;
  }
}
