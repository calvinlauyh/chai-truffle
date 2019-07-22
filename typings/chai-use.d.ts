export module ChaiUse {
  export interface Utils {
    flag(assertion: Chai.Assertion, name: string): any;
    flag(assertion: Chai.Assertion, name: string, value: any): void;
    addMethod(
      prototype: Chai.Assertion,
      method: string,
      assertFn: (this: Assertion, ...args: any) => void,
    ): void;
    addProperty(
      prototype: Chai.Assertion,
      property: string,
      assertFn: (this: Assertion) => void,
    ): Assertion;
  }

  export interface Assertion extends Chai.Assertion {
    _obj: any;
    then: any;
    assert(
      expression: any,
      errorMessage: string,
      negatedErrorMessage: string,
      expected?: any,
      actual?: any,
    ): void;
  }
}
