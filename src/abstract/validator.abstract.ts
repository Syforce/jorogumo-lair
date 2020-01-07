// import { DocFunction } from "../../../zitiron/src/service/doc-function.interface";
import { IValidator, IntegerValidator, StringValidator, ArrayValidator, OptionalValidator, RequiredValidator, ValidatorPriority, ValidatorType } from 'wulgaru';

export abstract class Validator {
    public priority: ValidatorPriority;

    private constructor() {}

    abstract validate(field): boolean;

    /**
     * Check if given field is empty
     * @returns {DocFunction}
     */
    // public static isEmpty(field) {
    //     return !!field;
    // }

    /**
     * Check if given field is string
     * @returns {DocFunction}
     */
    public static isString(): IValidator {
        return new StringValidator();
        // return {
        //     function: (field: any) => {
        //         return typeof field === 'string';
        //     },
        //     message: `Must be a string`,
        //     code: 4000
        // };
    }

    /**
     * Check if given field is number
     * @returns {DocFunction}
     */
    public static isInteger(): IValidator {
        return new IntegerValidator();

        // return {
        //     function: (field: any) => {
        //         return typeof field === 'number';
        //     },
        //     message: `Must be a number`,
        //     code: 4001
        // };
    }

    /**
     * Check if given field (string) value is longer than given value
     * @param {number} value
     * @returns {DocFunction}
     */
    public static minLength(value: number): IValidator {
        return {
            priority: ValidatorPriority.VALUE_PRIORITY,
            type: ValidatorType.INTEGER,
            validate: (field) => {
                return field.length > value;
            }
        }
        // return {
        //     function: (field: any) => {
        //         return field.length > value;
        //     },
        //     message: `Min length ${value}`,
        //     code: 4002
        // }
    }


    /**
     * Check if given field (string) value is shorter than given value
     * @param {number} value
     * @returns {DocFunction}
     */
    public static maxLength(value: number): IValidator {
        return {
            priority: ValidatorPriority.VALUE_PRIORITY,
            type: ValidatorType.INTEGER,
            validate: (field) => {
                return field.length < value;
            }
        }
        // return {
        //     function: (field: any) => {
        //         return field.length < value;
        //     },
        //     message: `Max length ${value}`,
        //     code: 4003
        // }
    }

    /**
     * Check if given field value is less than given value
     * @param {number} value
     * @returns {DocFunction}
     */
    public static lessThan(value: number): IValidator {
        return {
            priority: ValidatorPriority.VALUE_PRIORITY,
            type: ValidatorType.INTEGER,
            validate: (field) => {
                return field < value;
            }
        }
        // return {
        //     function: (field: any) => {
        //         return field < value;
        //     },
        //     message: `Less than ${value}`,
        //     code: 4004
        // };
    }

    /**
     * Check if given field value is greater than given value
     * @param {number} value
     * @returns {DocFunction}
     */
    public static greaterThan(value: number): IValidator {
        return {
            priority: ValidatorPriority.VALUE_PRIORITY,
            type: ValidatorType.INTEGER,
            validate: (field) => {
                return field > value;
            }
        }
        // return {
        //     function: (field: any) => {
        //         return field > value;
        //     },
        //     message: `Greater than ${value}`,
        //     code: 4005
        // };
    }

    /**
     * Used top specify that an field is optional
     * @returns {DocFunction}
     */
    public static isOptional(): IValidator {
        return new OptionalValidator();
        // return {
        //     function: () => {
        //         return true;
        //     },
        //     message: `It's optional`,
        //     code: 0
        // }
    }

    public static isRequired(): IValidator {
        return new RequiredValidator();
    }

    public static isArray(): IValidator {
        return new ArrayValidator();
    }
}
