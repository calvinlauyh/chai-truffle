/// <reference types="../index" />
/// <reference types="../typings/chai" />
/// <reference types="../typings/truffle" />

import { isNil } from "./utils";

export default (chai: any, utils: ChaiUse.Utils): void => {
  const Assertion: any = chai.Assertion;

  const property = (
    name: string,
    assertFn: (this: ChaiUse.Assertion) => Chai.Assertion,
  ) => {
    Assertion.addProperty(name, assertFn);
  };

  const method = (
    name: string,
    assertFn: (this: ChaiUse.Assertion, ...args: any) => Chai.Assertion,
  ) => {
    Assertion.addMethod(name, assertFn);
  };

  method("evmSuccess", function(this: ChaiUse.Assertion) {
    assertIsPromiseLike(this._obj);

    const obj: Promise<any> = this._obj;
    const derivedPromise = obj.then(
      (result: any) => {
        // Promise resolves to transaction response, if the assertion expect not
        // to broadcast, then it should fail.
        failNegatedAssertion(
          this,
          "expected transaction to fail in EVM, but it succeeded",
        );
        new Assertion(result).to.be.transactionResponse;
      },
      (err: Error) => {
        // Promise rejects to error, if the assertion expect to broadcast,
        // then it should fail.
        failAssertion(
          this,
          "expected transaction to succeed in EVM, but it failed",
          {
            actual: err,
          },
        );
      },
    );

    this.then = derivedPromise.then.bind(derivedPromise);
    return this;
  });

  method("evmFail", function(
    this: ChaiUse.Assertion,
    expectedErrorMessage?: string,
  ) {
    assertIsPromiseLike(this._obj);

    const obj: Promise<any> = this._obj;
    const derivedPromise = obj.then(
      (result: any) => {
        // Promise resolves to transaction response, if the assertion expect to fail,
        // then it should fail.
        const failMessage = isNil(expectedErrorMessage)
          ? "expected transaction to fail in EVM, but it succeeded"
          : `expected transaction to fail in EVM because of ${expectedErrorMessage}, but it succeeded`;
        failAssertion(this, failMessage, {
          actual: result,
        });

        new Assertion(result).to.be.transactionResponse;
      },
      (err: Error) => {
        if (isNil(expectedErrorMessage)) {
          // Promise rejects to error, if the assertion expect not to fail,
          // then it should fail.
          failNegatedAssertion(
            this,
            "expected transaction to succeed in EVM, but it failed",
            {
              actual: err,
            },
          );
        } else {
          this.assert(
            err.message.indexOf(expectedErrorMessage as string) !== -1,
            `expected transaction to fail in EVM because of ${expectedErrorMessage}, but it failed of another reason`,
            `expected transaction not to fail in EVM because of ${expectedErrorMessage}, but it was`,
            expectedErrorMessage,
            err,
          );
        }
      },
    );

    this.then = derivedPromise.then.bind(derivedPromise);
    return this;
  });

  method("evmOutOfGas", function(this: ChaiUse.Assertion) {
    return this.to.evmFail("out of gas");
  });

  method("evmRevert", function(this: ChaiUse.Assertion) {
    return this.to.evmFail("revert");
  });

  property("transactionResponse", function(
    this: ChaiUse.Assertion,
  ): ChaiUse.Assertion {
    this.assert(
      isTransactionResponse(this._obj),
      "expected #{this} to be a Truffle TransactionResponse",
      "expected #{this} not to be a Truffle TransactionResponse",
    );

    return this;
  });

  method("eventLength", eventLengthAssertFn);
  method("eventLengthOf", eventLengthAssertFn);

  method("emitEvent", function(
    this: ChaiUse.Assertion,
    expectedEventName?: string,
  ) {
    if (isNil(expectedEventName)) {
      return assertHasEventEmittedWithAssertion(this);
    }
    new Assertion(this._obj).to.be.transactionResponse;

    const obj: Truffle.TransactionResponse = this._obj;
    const matchedEventLogIndexList = obj.logs.filter(
      (log) => !isNil(log.event) && log.event === expectedEventName,
    ).map((log) => log.logIndex);
    const hasMatchedEvent = matchedEventLogIndexList.length !== 0;

    this.assert(
      hasMatchedEvent,
      `expected transaction to emit event ${expectedEventName}, but was not emitted`,
      `expected transaction not to emit event ${expectedEventName}, but was emitted`,
    );

    setEmitEventLogPosition(this, matchedEventLogIndexList);
    updateNegatedBeforeAssertEmitEvent(this);

    return this;
  });

  method("emitEventAt", function(
    this: ChaiUse.Assertion,
    expectedEventName: string,
    position: number,
  ) {
    const objAssertion = new Assertion(this._obj);
    objAssertion.to.be.transactionResponse;

    const obj: Truffle.TransactionResponse = this._obj;

    const objLogSize = obj.logs.length;
    const positionOutOfLogsSize = position > objLogSize - 1;
    if (positionOutOfLogsSize) {
      if (isNegated(this)) {
        return this;
      }
      throw new Error(
        `expected transaction to emit event ${expectedEventName} at position ${position}, but only ${objLogSize} event(s) was emitted`,
      );
    }
    const eventAtTargetPosition = obj.logs[position].event;
    const hasTargetEventEmittedAtPosition =
      eventAtTargetPosition === expectedEventName;

    this.assert(
      hasTargetEventEmittedAtPosition,
      `expected transaction to emit event ${expectedEventName} at position ${position}, but ${eventAtTargetPosition} was emitted`,
      `expected transaction not to emit event ${expectedEventName} at position ${position}, but was emitted`,
    );

    setEmitEventLogPosition(this, [position]);
    updateNegatedBeforeAssertEmitEvent(this);

    return this;
  });

  method("withEventArgs", function(
    this: ChaiUse.Assertion,
    assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
  ): ChaiUse.Assertion {
    if (!isEmitEventAsserted(this)) {
      throw new Error(
        "to assert event arguments the assertion must be asserted with emitEvent() or emitEventAt() first. i.e. expect(...).to.emitEvent(...).withEventArgs(...)",
      );
    }
    if (isNegatedBeforeAssertEmitEvent(this)) {
      throw new Error(
        "expect(...).not.to.emitEvent(...).withEventArgs(...) pattern is not support. If you are asserting a transaction has emitted an event but not with the certain argument format, consider using expect(...).to.emitEvent(...).not.withEventArgs(...) instead",
      );
    }

    const obj: Truffle.TransactionResponse = this._obj;
    const eventLogPositionList = getEmitEventLogPosition(this);

    const firstMatchedEventLogIndex = eventLogPositionList[0];
    const eventName = obj.logs[firstMatchedEventLogIndex].event;

    const matchedEventPosition = eventLogPositionList.find((position) => {
      const eventLog = obj.logs[position];
      return assertArgsFn(eventLog.args);
    });
    const hasMatchedEvent = typeof matchedEventPosition !== "undefined";

    this.assert(
      hasMatchedEvent,
      `expected transaction to emit event ${eventName} with argument(s) matching assert function, but argument(s) do not match`,
      `expected transaction to emit event ${eventName} but not with argument(s) matching assert function, but argument(s) match`,
    );

    return this;
  });

  method("emitEventWithArgs", function(
    this: ChaiUse.Assertion,
    expectedEventName: string,
    assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
  ) {
    new Assertion(this._obj).to.be.transactionResponse;

    const obj: Truffle.TransactionResponse = this._obj;

    const matchedEventLog = obj.logs.find(
      (log) =>
        !isNil(log) &&
        log.event === expectedEventName &&
        assertArgsFn(log.args),
    );
    const hasMatchedEvent = !!matchedEventLog;

    this.assert(
      hasMatchedEvent,
      `expected transaction to emit event ${expectedEventName} with argument(s) matching assert function, but was not emitted`,
      `expected transaction not to emit event ${expectedEventName} with argument(s) matching assert function, but was emitted`,
    );

    return this;
  });

  method("emitEventWithArgsAt", function(
    this: ChaiUse.Assertion,
    expectedEventName: string,
    assertArgsFn: (args: Truffle.TransactionLogArgs) => boolean,
    position: number,
  ) {
    new Assertion(this._obj).to.be.transactionResponse;
    const obj: Truffle.TransactionResponse = this._obj;

    const objLogSize = obj.logs.length;
    const isPositionOutOfLogsSize = position > obj.logs.length - 1;
    if (isPositionOutOfLogsSize) {
      if (isNegated(this)) {
        return this;
      }
      throw new Error(
        `expected transaction to emit event ${expectedEventName} at position ${position}, but only ${objLogSize} event(s) are emitted`,
      );
    }
    const targetEventLog = obj.logs[position];

    this.assert(
      assertArgsFn(targetEventLog.args),
      `expected transaction to emit event ${expectedEventName} at position ${position} with argument(s) matching assert function, but was not emitted`,
      `expected transaction not to emit event ${expectedEventName} at position ${position} with argument(s) matching assert function, but was emitted`,
      expectedEventName,
      targetEventLog.event,
    );

    return this;
  });

  const assertIsPromiseLike = (value: any) => {
    new Assertion(value).assert(
      typeof value.then !== "undefined",
      "expected #{this} to be a Promise",
      "expected #{this} not to be a Promise",
    );
  };

  const TRANSACTION_RESPONSE_KEYS = ["tx", "receipt", "logs"];
  const isTransactionResponse = (value: any): boolean => {
    if (typeof value !== "object") {
      return false;
    }
    if (isNil(value)) {
      return false;
    }

    for (const key of TRANSACTION_RESPONSE_KEYS) {
      if (typeof value[key] === "undefined") {
        return false;
      }
    }
    return true;
  };

  const assertHasEventEmittedWithAssertion = (
    assertion: ChaiUse.Assertion,
  ): ChaiUse.Assertion => {
    new Assertion(assertion._obj).to.be.transactionResponse;

    const obj: Truffle.TransactionResponse = assertion._obj;
    const logWithEventFound = obj.logs.find((log) => !isNil(log.event));
    const hasEventEmitted = !!logWithEventFound;
    const eventEmitted =
      hasEventEmitted && (logWithEventFound as Truffle.TransactionLog).event;

    assertion.assert(
      hasEventEmitted,
      "expected transaction to emit event, but none was emitted",
      `expected transaction not to emit event, but event ${eventEmitted} was emitted`,
    );

    return assertion;
  };

  const isNegated = (assertion: ChaiUse.Assertion): boolean => {
    return !isNil(utils.flag(assertion, "negate"));
  };

  const isNegatedBeforeAssertEmitEvent = (
    assertion: ChaiUse.Assertion,
  ): boolean => {
    return !isNil(utils.flag(assertion, "truffleNegatedBeforeAssertEmitEvent"));
  };

  const isEmitEventAsserted = (assertion: ChaiUse.Assertion): boolean => {
    return !isNil(utils.flag(assertion, "truffleEmitEventLogPositionList"));
  };

  const setEmitEventLogPosition = (
    assertion: ChaiUse.Assertion,
    positionList: number[],
  ) => {
    utils.flag(assertion, "truffleEmitEventLogPositionList", positionList);
  };

  const updateNegatedBeforeAssertEmitEvent = (assertion: ChaiUse.Assertion) => {
    if (isNegated(assertion)) {
      return utils.flag(assertion, "truffleNegatedBeforeAssertEmitEvent", true);
    }
  };

  const getEmitEventLogPosition = (assertion: ChaiUse.Assertion): number[] => {
    return utils.flag(assertion, "truffleEmitEventLogPositionList");
  };

  function eventLengthAssertFn(
    this: ChaiUse.Assertion,
    expectedLength: number,
  ): ChaiUse.Assertion {
    assertIsTransactionResponse(this._obj);

    const actualEventLogLength = (this._obj as Truffle.TransactionResponse).logs
      .length;
    this.assert(
      actualEventLogLength === expectedLength,
      `expected transaction to emit ${expectedLength} event log(s), but ${actualEventLogLength} was emitted`,
      `expected transaction not to emit ${expectedLength} event log(s)`,
      expectedLength, // TODO
      actualEventLogLength,
    );

    return this;
  }

  /**
   *
   * @param assertion Chai.use Assertion
   * @param value The
   */
  const assertIsTransactionResponse = (value: any) => {
    new Assertion(value).is.transactionResponse;
  };
};

const failNegatedAssertion = (
  assertion: ChaiUse.Assertion,
  message: string,
  value: FailAssertionValue = {},
) => {
  assertion.assert(true, "", message, value.expected, value.actual);
};
const failAssertion = (
  assertion: ChaiUse.Assertion,
  message: string,
  value: FailAssertionValue = {},
) => {
  assertion.assert(false, message, "", value.expected, value.actual);
};
interface FailAssertionValue {
  expected?: any;
  actual?: any;
}
