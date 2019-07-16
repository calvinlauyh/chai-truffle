# Chai Assertions for Truffle

[![NPM Version](https://img.shields.io/npm/v/chai-truffle.svg)](https://www.npmjs.com/package/chai-truffle)
[![Code Coverage](https://img.shields.io/codecov/c/github/calvinlauco/chai-truffle.svg?token=da31e45005754a838c6e44ce946ed23a)](https://codecov.io/gh/calvinlauco/chai-truffle)
[![Build Status](https://img.shields.io/travis/calvinlauco/chai-truffle/master.svg)](https://travis-ci.org/calvinlauco/chai-truffle)
[![License: MIT](https://img.shields.io/github/license/calvinlauco/chai-truffle.svg)](https://github.com/calvinlauco/chai-truffle)

**Chai Truffle** extends [Chai](http://chaijs.com/) to provide assertion for [Truffle](https://www.trufflesuite.com/) Transaction. Complete TypeScript typings are provided with this library.

With **Chai Truffle**, you can assert event emission on contract call easily. This library tries to make assertion as fluent as English sentence. 
```javascript
const response = await bankInstance.deposit(oneEtherInWei);

expect(response)
    .to.emitEvent("Deposit")
    .withEventArgs((args) => {
        expect(args.from).to.eq(defaultAccount);
        expect(args.amount.toString(10)).to.eq(oneEtherInWei);

        return true;
    });
```

**Chai Truffle** can also help assert EVM execution result.
```javascript
return expect(response).to.evmRevert();
```
Remarks: When trying to used with EVM execution assertion, `return` must be used because it is an asynchronous assertion.

## Quick Navigation
- [Installation](#installation)
- [How to use](#how-to-use)
- [APIs](#apis)
  - [Event APIs](#event-apis)
  - [EVM Execution Result APIs](#evm-execution-result-apis)
- [Difference between .emitEvent().withArgs() and .emitEventWithArgs()](#difference-between-emiteventwithargs-and-emiteventwithargs)
- [Example](#example)

## Installation

```shell
npm install chai-truffle
```

## How to use
**Chai Truffle** is compatible with both CommonJS module system and TypeScript.

### CommonJS
```javascript
const chai = require("chai");
const ChaiTruffle = require("chai-truffle");
chai.use(ChaiTruffle);
```

### TypeScript
```typescript
import chai from "chai";
import chaiTruffle = require("chai-truffle");
chai.use(chaiTruffle);
```
Remarks: `import = require()` syntax must be used to import **Chai Truffle**

## APIs

The library is shipped with [Event APIs](#event-apis) and [EVM execution result APIs](#evm-execution-result-apis).

## Event APIs

### .transactionResponse

Assert if a value is Transaction Response liked object
```javascript
const response = await bankInstance.withdraw(oneEtherInWei);

expect(response).to.be.transactionResponse;
```

### .emitEvent([eventName][, message])
Asserts if any event has been emitted from the transaction. If `eventName` is provided, it will assert if an event with the `eventName` has been emitted.
```javascript
const response = await bankInstance.withdraw(oneEtherInWei);

expect(response).to.emitEvent("Withdrawal");
```

### .emitEventAt(eventName, position[, message])
Assert if the event with `eventName` has been emitted at the specified log `position`.
```javascript
const response = await bankInstance.batchWithdraw(oneEtherInWei);

expect(response).to.emitEventAt("Withdrawal", 2);
```
Remarks: Event log position begins from 0.

### .withEventArgs(argumentAssertFunction)
Use in conjunction with `.emitEvent()` and `emitEventAt()` to assert if the emitted event has parameters satisfying the [`argumentAssertFunction`](#argument-assert-function).
```javascript
const response = await bankInstance.withdraw(oneEtherInWei);

expect(response).to.emitEvent("Withdrawal").withEventArgs((args) => {
    expect(args.to).to.eq(defaultAccount);
    expect(args.amount).to.eq(oneEtherInWei);
});
```

### .emitEventWithArgs(eventName, argumentAssertFunction[, message])
Assert if a event with `eventName` and matching parameter has been emitted. The [`argumentAssertFunction`](#argument-assert-function) is used to match the event arguments. It is a shorthand of the `emitEvent().withEventArgs()` but they have [subtle difference in behaviour](#emit-family-difference) in some scenarios.
```javascript
expect(response).to.emitEventWithArgs("Deposit", (args) => {
    expect(args.from).to.eq(defaultAccount);
    expect(args.amount).to.eq(oneEtherInWei);
});
```

### .emitEventWithArgsAt(eventName, argumentAssertFunction, position[, message])
Similar to `.emitEventWithArgs()`, it asserts if a  event with `eventName` and matching parameter has been emitted at a specified log position. The [`argumentAssertFunction`](#argument-assert-function) is used to match the event arguments.
```javascript
// Checking for a Deposit event in the 3rd event log of a transaction
expect(response).to.emitEventWithArgs("Deposit", (args) => {
    expect(args.from).to.eq(defaultAccount);
    expect(args.amount).to.eq(oneEtherInWei);
}, 2);
```
Remarks: Event log position begins at 0

### .eventLength(length[, message])

Assert if transaction has emitted `length` of events.
```javascript
const response = bankContract.batchWithdraw(oneEtherInWei);

expect(response).to.have.eventLength(2);
```

### .eventLengthOf(length[, message])

Alias of `.eventLength`

### Argument Assert Function
Argument assert function takes the form
```typescript
(args: Truffle.TransactionLogArgs) => boolean
```

`args` is an array-liked object containing both parameter name and parameter index as key. If you have a solidity contract of event:
```solidity
event Deposit(
    address indexed from,
    uint amount
);
```
The corresponding `args` object will be:
```javascript
{
    from: "{From Address}",
    [0]: "{From Address}",
    amount: "{Amount}",
    [1]: "{Amount}",
};
```

You can define your parameter assert function be like
```javascript
(args) => {
    expect(args.from).to.eq(defaultAccount);
    expect(args.amount).to.eq(oneEtherInWei);

    return true;
}
```

Remarks: Boolean must be returned at the end of the parameter assert function or otherwise assertion will consider the parameters to be unmatched.

All event parameters assertions (`.withEventArgs()`, `.emitEventWithArgs()`, `.emitEventWithArgsAt()`) support Chai assertion inside the parameter assert function. They will capture the assertion errors inside and displayed as test result:
```javascript
const defaultAccount = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";
expect(response).to.emitEvent("Deposit").withEventArgs((args) => {
    expect(args.from).to.eq(defaultAccount);
    expect(args.amount).to.eq(oneEtherInWei);
});

///
$ AssertionError: expected transaction to emit event 'Deposit' with matching argument(s), but argument(s) assert function got: 'expected '0x627306090abaB3A6e1400e9345bC60c78a8BEf57' to equal '0xf17f52151EbEF6C7334FAD080c5704D77216b732''
      + expected - actual

      -0x627306090abaB3A6e1400e9345bC60c78a8BEf57
      +0xf17f52151EbEF6C7334FAD080c5704D77216b732
```

---

## EVM Execution Result APIs

The EVM execution result assertion APIs help to check if a transaction has passed EVM execution. If not, what error has occurred.

Note that `return` must be used because EVM execution error are thrown from the Promise, the assertion is asynchronous.
```javascript
return(contractInstance.revertImmediately()).to.evmFail();
```

### .evmSuccess([message])

Assert if the transaction call has passed the EVM execution successfully.
```javascript
return expect(BankInstance.withdraw(oneEtherInWei)).to.evmSuccess();
```

### .evmFail([reason][, message])

Assert if the transaction call has failed the EVM execution. If `reason` is provided, it will assert if the thrown error message contains the reason keyword.
```javascript
return expect(BankInstance.withdraw(outOfBalanceWei)).to.evmFail();
```
```javascript
return expect(BankInstance.withdraw(oneEtherInWei)).to.evmFail("Insufficient balance");
```

### .evmRevert([message])

Assert if the transaction call has failed the EVM execution because of revert.
```javascript
return expect(ContractInstance.revertImmediately()).to.evmFail();
```

### .evmOutOfGas([message])

Assert if the transaction call has failed the EVM execution because of run out of gas.
```javascript
return expect(ContractInstance.drainGas()).to.evmOutOfGas();
```

### .evmInvalidOpcode([message])

Assert if the transaction call has failed the EVM execution because of invalid opcode.
```javascript
return expect(ContractInstance.assertFail()).to.emvInvalidOpcode();
```

## Difference between `.emitEvent().withArgs()` and `.emitEventWithArgs()`

At first glance these two assertions may seems to be the same when asserting a particular event with arguments has been emitted.
```javascript
expect(response).to.emitEvent("Deposit").withEventArgs((args) => {
    expect(args.from).to.eq(defaultAccount);
    expect(args.amount).to.eq(oneEtherInWei);

    return true;
})
// is the same as
expect(response).to.emitEventWithArgs("Deposit", (args) => {
    expect(args.from).to.eq(defaultAccount);
    expect(args.amount).to.eq(oneEtherInWei);

    return true;
})
```

Their difference is when you are asserting a particular event with parameter is **NOT** emitted.

`.emitEvent().not.withEventArgs()` is useful when you want to assert a event with event name is emitted but not with the arguments you specified. For example you are certain that a `Deposit` event is emitted, but you want to make sure it is not emitted with wrong arguments.

The below example will pass only when `Deposit` event is emitted but with non-matching arguments.
```javascript
const response = bankInstance.deposit({
    value: oneEtherInWei,
});

expect(response).to.emitEvent("Deposit").not.withEventArgs((args) => {
    expect(args.amount).eq.eq(twoEtherInWei);

    return true;
});
```

If you use `.not.emitEventWithArgs()`, the assertion will pass event if `Deposit` event is not emitted.

For more details, please refer to Wiki for [Detailed assertion truth table](https://github.com/calvinlauco/chai-truffle/wiki/EmitEvent-Family-Assertion-Truth-Table#emiteventnotwitheventargs-and-notemiteventwithargs)

## Example

There is a simple Bank contract with test cases example to illustrate how to integrate `Chai Truffle` with Truffle contract. For setup and details, please refer to [README](https://github.com/calvinlauco/chai-truffle/example) under `example/` directory.

## Contribution

Contribution and feedbacks are welcome. Feel free to leave issues or fork and submit your PR.

## License

This library is published under [MIT](https://github.com/calvinlauco/chai-truffle/LICENSE) license
