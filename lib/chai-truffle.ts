import { ChaiUse } from "../typings/chai-use";
import { TrufflePolyfill } from "../typings/truffle-polyfill";
import { isNil } from "./utils";

export = (chai: any, utils: ChaiUse.Utils): void => {
  const Assertion: any = chai.Assertion;
  const flag = utils.flag;

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

  method("emitEvent", function(
    this: ChaiUse.Assertion,
    expectedEventName?: string,
    message?: string,
  ) {
    setMessageIfProvided(this, message);

    if (isNil(expectedEventName)) {
      return assertHasEventEmittedWithAssertion(this, message);
    }
    assertIsTransactionResponse(this._obj, message);

    const obj: TrufflePolyfill.TransactionResponse = this._obj;
    const matchedEventLogIndexList = obj.logs
      .filter((log) => !isNil(log.event) && log.event === expectedEventName)
      .map((log) => log.logIndex);
    const hasMatchedEvent = matchedEventLogIndexList.length !== 0;

    this.assert(
      hasMatchedEvent,
      `expected transaction to emit event '${expectedEventName}', but was not emitted`,
      `expected transaction not to emit event '${expectedEventName}', but was emitted`,
    );

    setEmitEventLogPositionList(this, matchedEventLogIndexList);
    updateNegatedBeforeAssertEmitEvent(this);

    return this;
  });

  const assertHasEventEmittedWithAssertion = (
    assertion: ChaiUse.Assertion,
    message: string | undefined,
  ): ChaiUse.Assertion => {
    assertIsTransactionResponse(assertion._obj, message);

    const obj: TrufflePolyfill.TransactionResponse = assertion._obj;
    const logWithEventFound = obj.logs.find((log) => !isNil(log.event));
    const hasEventEmitted = !!logWithEventFound;
    const eventEmitted =
      hasEventEmitted && (logWithEventFound as TrufflePolyfill.TransactionLog).event;

    assertion.assert(
      hasEventEmitted,
      "expected transaction to emit event, but none was emitted",
      `expected transaction not to emit event, but event '${eventEmitted}' was emitted`,
    );

    return assertion;
  };

  method("emitEventAt", function(
    this: ChaiUse.Assertion,
    expectedEventName: string,
    position: number,
    message?: string,
  ) {
    setMessageIfProvided(this, message);

    assertIsTransactionResponse(this._obj, message);

    const obj: TrufflePolyfill.TransactionResponse = this._obj;

    const objLogSize = obj.logs.length;
    const positionOutOfLogsSize = position > objLogSize - 1;
    if (positionOutOfLogsSize) {
      failAssertion(
        this,
        `expected transaction to emit event '${expectedEventName}' at position ${position}, but only ${objLogSize} event(s) was emitted`,
      );

      return this;
    }
    const eventAtTargetPosition = obj.logs[position].event;
    const hasTargetEventEmittedAtPosition =
      eventAtTargetPosition === expectedEventName;

    this.assert(
      hasTargetEventEmittedAtPosition,
      `expected transaction to emit event '${expectedEventName}' at position ${position}, but '${eventAtTargetPosition}' was emitted`,
      `expected transaction not to emit event '${expectedEventName}' at position ${position}, but was emitted`,
      expectedEventName,
      eventAtTargetPosition,
    );

    setEmitEventLogPositionList(this, [position]);
    updateNegatedBeforeAssertEmitEvent(this);

    return this;
  });

  method("emitEventWithArgs", function(
    this: ChaiUse.Assertion,
    expectedEventName: string,
    assertArgsFn: AssertArgsFn,
    message?: string,
  ) {
    setMessageIfProvided(this, message);

    assertIsTransactionResponse(this._obj, message);

    const obj: TrufflePolyfill.TransactionResponse = this._obj;

    const matchedEventLogs = obj.logs.filter(
      (log) => !isNil(log) && log.event === expectedEventName,
    );

    const hasMatchedEventLogs = matchedEventLogs.length !== 0;
    if (!hasMatchedEventLogs) {
      failAssertion(
        this,
        `expected transaction to emit event '${expectedEventName}' with matching argument(s), but was not emitted`,
      );

      return this;
    }

    const errorMessagePrefix = `expected transaction to emit event '${expectedEventName}' with matching argument(s)`;
    const negatedErrorMessage = `expected transaction not to emit event '${expectedEventName}' with matching argument(s), but was emitted`;
    assertEventArgsFromMatchedEventLogsWithAssertion(
      this,
      matchedEventLogs,
      assertArgsFn,
      errorMessagePrefix,
      negatedErrorMessage,
    );

    return this;
  });

  method("emitEventWithArgsAt", function(
    this: ChaiUse.Assertion,
    expectedEventName: string,
    assertArgsFn: AssertArgsFn,
    position: number,
    message?: string,
  ) {
    setMessageIfProvided(this, message);

    assertIsTransactionResponse(this._obj, message);

    const obj: TrufflePolyfill.TransactionResponse = this._obj;

    const objLogSize = obj.logs.length;
    const isPositionOutOfLogsSize = position > obj.logs.length - 1;
    if (isPositionOutOfLogsSize) {
      failAssertion(
        this,
        `expected transaction to emit event '${expectedEventName}' at position ${position}, but only ${objLogSize} event(s) are emitted`,
      );

      return this;
    }

    const targetEventLog = obj.logs[position];

    if (targetEventLog.event !== expectedEventName) {
      failAssertion(
        this,
        `expected transaction to emit event '${expectedEventName}' at position ${position} with matching argument(s), but was not emitted`,
      );
      return this;
    }

    const errorMessagePrefix = `expected transaction to emit event '${expectedEventName}' at position ${position} with matching argument(s)`;
    const negatedErrorMessage = `expected transaction not to emit event '${expectedEventName}' at position ${position} with matching argument(s), but was emitted`;
    assertEventArgsFromMatchedEventLogsWithAssertion(
      this,
      [targetEventLog],
      assertArgsFn,
      errorMessagePrefix,
      negatedErrorMessage,
    );

    return this;
  });

  method("eventLength", eventLengthAssertFn);
  method("eventLengthOf", eventLengthAssertFn);

  function eventLengthAssertFn(
    this: ChaiUse.Assertion,
    expectedLength: number,
    message?: string,
  ): ChaiUse.Assertion {
    setMessageIfProvided(this, message);

    assertIsTransactionResponse(this._obj, message);

    const actualEventLogLength = (this._obj as TrufflePolyfill.TransactionResponse).logs
      .length;
    this.assert(
      actualEventLogLength === expectedLength,
      `expected transaction to emit ${expectedLength} event log(s), but ${actualEventLogLength} was emitted`,
      `expected transaction not to emit ${expectedLength} event log(s)`,
      expectedLength,
      actualEventLogLength,
    );

    return this;
  }

  const assertIsTransactionResponse = (
    value: any,
    message: string | undefined,
  ) => {
    const assertion = new Assertion(value);
    setMessageIfProvided(assertion, message);

    assertion.is.transactionResponse;
  };

  method("evmFail", function(
    this: ChaiUse.Assertion,
    expectedErrorMessage?: string,
    message?: string,
  ) {
    setMessageIfProvided(this, message);

    assertIsPromiseLike(this._obj);

    const obj: Promise<any> = this._obj;
    const derivedPromise = obj.then(
      (result: any) => {
        // Promise resolves to transaction response, if the assertion expect to fail,
        // then it should fail.
        const failMessage = isNil(expectedErrorMessage)
          ? "expected transaction to fail in EVM, but it succeeded"
          : `expected transaction to fail in EVM because of '${expectedErrorMessage}', but it succeeded`;
        failAssertion(this, failMessage, {
          actual: result,
        });

        assertIsTransactionResponse(result, message);
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
          const isErrorMessageMatch =
            err.message.indexOf(expectedErrorMessage as string) !== -1;
          this.assert(
            isErrorMessageMatch,
            `expected transaction to fail in EVM because of '${expectedErrorMessage}', but it failed of another reason: ${err.message}`,
            `expected transaction not to fail in EVM because of '${expectedErrorMessage}', but it was`,
            expectedErrorMessage,
            err.message,
          );
        }
      },
    );

    this.then = derivedPromise.then.bind(derivedPromise);
    return this;
  });

  method("evmInvalidOpcode", function(this: ChaiUse.Assertion, message?: string) {
    return this.to.evmFail("invalid opcode", message);
  });
  method("evmOutOfGas", function(this: ChaiUse.Assertion, message?: string) {
    return this.to.evmFail("out of gas", message);
  });

  method("evmRevert", function(this: ChaiUse.Assertion, message?: string) {
    return this.to.evmFail("revert", message);
  });

  method("evmSuccess", function(this: ChaiUse.Assertion, message?: string) {
    setMessageIfProvided(this, message);

    assertIsPromiseLike(this._obj, message);

    const obj: Promise<any> = this._obj;
    const derivedPromise = obj.then(
      (result: any) => {
        // Promise resolves to transaction response, if the assertion expect not
        // to broadcast, then it should fail.
        failNegatedAssertion(
          this,
          "expected transaction to fail in EVM, but it succeeded",
        );
        assertIsTransactionResponse(result, message);
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

  method("withEventArgs", function(
    this: ChaiUse.Assertion,
    assertArgsFn: (args: TrufflePolyfill.TransactionLogArgs) => boolean,
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

    const obj: TrufflePolyfill.TransactionResponse = this._obj;
    const eventLogPositionList = getEmitEventLogPositionList(this);

    const firstMatchedEventLogIndex = eventLogPositionList[0];
    const eventName = obj.logs[firstMatchedEventLogIndex].event;

    const matchedEventLogs = eventLogPositionList.map(
      (position) => obj.logs[position],
    );

    const errorMessagePrefix = `expected transaction to emit event '${eventName}' with matching argument(s)`;
    const negatedErrorMessage = `expected transaction to emit event '${eventName}' but not with matching argument(s), but argument(s) match`;
    assertEventArgsFromMatchedEventLogsWithAssertion(
      this,
      matchedEventLogs,
      assertArgsFn,
      errorMessagePrefix,
      negatedErrorMessage,
    );

    return this;
  });

  const assertEventArgsFromMatchedEventLogsWithAssertion = (
    assertion: ChaiUse.Assertion,
    matchedEventLogs: TrufflePolyfill.TransactionLog[],
    assertArgsFn: AssertArgsFn,
    errorMessagePrefix: string,
    negatedErrorMessage: string,
  ) => {
    let hasMatchedEvent = false;
    let lastError: Error | undefined;
    for (const eventLog of matchedEventLogs) {
      try {
        if (assertArgsFn(eventLog.args)) {
          hasMatchedEvent = true;
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    let errorMessage = errorMessagePrefix;
    const assertionValue: FailAssertionValue = {};
    if (typeof lastError === "undefined") {
      errorMessage = `${errorMessage}, but argument(s) do not match`;
    } else {
      errorMessage = `${errorMessage}, but argument(s) assert function got: '${lastError.message}'`;
      if (lastError instanceof chai.AssertionError) {
        const assertionError = (lastError as unknown) as ChaiAssertionError;
        assertionValue.expected = assertionError.expected;
        assertionValue.actual = assertionError.actual;
      }
    }

    assertion.assert(
      hasMatchedEvent,
      errorMessage,
      negatedErrorMessage,
      assertionValue.expected,
      assertionValue.actual,
    );
  };

  const assertIsPromiseLike = (value: any, message?: string) => {
    const assertion = new Assertion(value);
    setMessageIfProvided(assertion, message);

    assertion.assert(
      typeof value.then !== "undefined",
      "expected #{this} to be a Promise",
      "expected #{this} not to be a Promise",
      "Promise",
      typeof value,
    );
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

  const isNegated = (assertion: ChaiUse.Assertion): boolean => {
    return !isNil(flag(assertion, "negate"));
  };

  const isNegatedBeforeAssertEmitEvent = (
    assertion: ChaiUse.Assertion,
  ): boolean => {
    return !isNil(flag(assertion, "truffleNegatedBeforeAssertEmitEvent"));
  };

  const isEmitEventAsserted = (assertion: ChaiUse.Assertion): boolean => {
    return !isNil(flag(assertion, "truffleEmitEventLogPositionList"));
  };

  const setEmitEventLogPositionList = (
    assertion: ChaiUse.Assertion,
    positionList: number[],
  ) => {
    flag(assertion, "truffleEmitEventLogPositionList", positionList);
  };

  const setMessageIfProvided = (
    assertion: ChaiUse.Assertion,
    message: string | undefined,
  ) => {
    if (!isNil(message)) {
      flag(assertion, "message", message);
    }
  };

  const updateNegatedBeforeAssertEmitEvent = (assertion: ChaiUse.Assertion) => {
    if (isNegated(assertion)) {
      return flag(assertion, "truffleNegatedBeforeAssertEmitEvent", true);
    }
  };

  const getEmitEventLogPositionList = (
    assertion: ChaiUse.Assertion,
  ): number[] => {
    return flag(assertion, "truffleEmitEventLogPositionList");
  };
};

type AssertArgsFn = (args: TrufflePolyfill.TransactionLogArgs) => boolean;

interface FailAssertionValue {
  expected?: any;
  actual?: any;
}

type ChaiAssertionError = typeof Chai.AssertionError & {
  expected?: any;
  actual?: any;
};
