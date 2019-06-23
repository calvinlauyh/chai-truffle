/// <reference types="../index" />
/// <reference types="../typings/chai" />
/// <reference types="../typings/truffle" />

import { isNil } from "./utils";

export default (chai: any, utils: ChaiUse.Utils): void => {
  const Assertion: any = chai.Assertion;

  // const overwriteProperty = (
  //   name: string,
  //   assertionFn: (assertion: ChaiUse.Assertion) => ChaiUse.Assertion,
  // ) => {
  //   Assertion.overwriteProperty(name, (_super: any) => {
  //     return function(this: ChaiUse.Assertion) {
  //       if (!isTruffleAssertion(this)) {
  //         return _super.call(this);
  //       }

  //       return assertionFn(this);
  //     };
  //   });
  // };

  const property = (
    name: string,
    assertFn: (this: ChaiUse.Assertion) => ChaiUse.Assertion,
  ) => {
    Assertion.addProperty(name, assertFn);
  };

  const method = (
    name: string,
    assertFn: (this: ChaiUse.Assertion, ...args: any) => ChaiUse.Assertion,
  ) => {
    Assertion.addMethod(name, assertFn);
  };

  property("broadcast", function(this: ChaiUse.Assertion) {
    assertIsPromiseLike(this._obj);

    const obj: Promise<any> = this._obj;
    const derivedPromise = obj.then(
      (result: any) => {
        // Promise resolves to transaction response, if the assertion expect not
        // to broadcast, then it should fail.
        failNegatedAssertion(
          this,
          "expected not to broadcast, but broadcasted successfully",
        );
        new Assertion(result).to.be.transactionResponse;
      },
      (err: Error) => {
        // Promise rejects with error, if the assertion expect to broadcast,
        // then it should fail.
        failAssertion(this, "expected to broadcast, but fail with error", {
          actual: err,
        });
      },
    );

    this.then = derivedPromise.then.bind(derivedPromise);
    return this;
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

  property("eventEmitted", function(this: ChaiUse.Assertion) {
    return assertHasEventEmittedWithAssertion(this);
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

    const obj: Truffle.TransactionResponse = this._obj;
    const targetEventLogIndex = obj.logs.findIndex(
      (log) => !isNil(log.event) && log.event === expectedEventName,
    );
    const hasTargetEventEmitted = targetEventLogIndex !== -1;

    this.assert(
      hasTargetEventEmitted,
      `expected transaction to emit event ${expectedEventName}, but was not emitted`,
      `expected transaction not to emit event ${expectedEventName}, but was emitted`,
    );

    setEmitEventLogPosition(this, targetEventLogIndex);
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

    const positionOutOfLogsSize = position > obj.logs.length - 1;
    if (positionOutOfLogsSize) {
      if (isNegated(this)) {
        return this;
      }
      throw new Error(
        `expected transaction to emit event ${expectedEventName} at position ${position}, but none was emitted`,
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

    setEmitEventLogPosition(this, position);
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
        "expect(...).not.to.emitEvent(...).withEventArgs(...) pattern is not support. If you are asserting a transaction has emitted an event but not with the certain argument format, consider using expect(...).to.emitEvent(...).but.not.withEventArgs(...) instead",
      );
    }

    const obj: Truffle.TransactionResponse = this._obj;
    const eventLogPosition = getEmitEventLogPosition(this);
    const matchedEventLog = obj.logs[eventLogPosition];

    this.assert(
      assertArgsFn(matchedEventLog.args),
      `expected transaction to emit event ${matchedEventLog.event} with argument(s) matching assert function, but argument(s) do not match`,
      `expected transaction to emit event ${matchedEventLog.event} but not with argument(s) matching assert function, but argument(s) match`,
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
    return !isNil(utils.flag(assertion, "truffleEmitEventLogPosition"));
  };

  const setEmitEventLogPosition = (
    assertion: ChaiUse.Assertion,
    position: number,
  ) => {
    utils.flag(assertion, "truffleEmitEventLogPosition", position);
  };

  const updateNegatedBeforeAssertEmitEvent = (assertion: ChaiUse.Assertion) => {
    if (isNegated(assertion)) {
      return utils.flag(assertion, "truffleNegatedBeforeAssertEmitEvent", true);
    }
  };

  const getEmitEventLogPosition = (assertion: ChaiUse.Assertion): number => {
    return utils.flag(assertion, "truffleEmitEventLogPosition");
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
