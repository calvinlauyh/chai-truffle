import { TrufflePolyfill } from "./truffle-polyfill";

declare global {
    const web3: import("web3");
    function contract(name: string, testSuite: (accounts: TrufflePolyfill.Account[]) => void): void;
    const artifacts: TrufflePolyfill.Artifacts;
}
