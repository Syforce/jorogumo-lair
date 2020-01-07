import { Request } from 'express';

import { IParser, IValidator, ValidatorType } from 'wulgaru';
import { AbstractModelParser } from './model.parser';
import { IRequestData, IRequestData2, La } from "wulgaru/src/web/request-data.interface";
import { RequestField } from "wulgaru/src/web/request-field.interface";

import { Validator } from './validator.abstract';

export class Err {
    public message: string;

    constructor(message: string) {
        this.message = message;
    }
}

type X<T extends RequestField, P extends any> = {
    [K in keyof T]: [P[K]]
}

class Y<T extends La> {
    body: {
        [K in keyof T['body']]: true
    }
}

function asValue<T extends IRequestData<any>>(t: T): T {
    return t;
}

const theType = asValue({
    body: {
        id: []
    },
    params: {
        id: [],
        name: []
    }
});

type Tax = IRequestData2<typeof theType>;

const t: Tax = {
    body: {
        id: 'asd'
    },
    params: {
        id: 'asd',
        name: 10
    }
}

class Pair {
    public key: string | Array<string>;
    public validator: IValidator;
    public next: Pair;

    private helperFunction: Function;

    constructor(key: string | Array<string>, validator: IValidator, useHelper: boolean = false) {
        this.key = key;
        this.validator = validator;

        if (useHelper) {
            this.helperFunction = this.findHelper(this.validator);
        }
    }

    private findHelper(validator: IValidator): Function {
        if (validator.type == ValidatorType.INTEGER) {
            return (field) => {
                return parseInt(field);
            }
        }

        if (validator.next) {
            return this.findHelper(validator.next);
        }

        return null;
    }

    public validate(data, obj): boolean | Err {
        const field = this.getField(data);
        let value;

        if (this.helperFunction) {
            value = this.helperFunction(field);
        } else {
            value = field;
        }

        const result = this.validator.validate(value);

        if (result === true) {
            this.setField(obj, field);

            if (this.next) {
                return this.next.validate(data, obj);
            }

            return true;
        }

        return new Err(`Failed validator ${this.validator.type} for key ${this.key}`);
    }

    private getField(data) {
        if (typeof this.key !== 'string') {
            let swap = data;

            for (let i = 0; i < this.key.length; i++) {
                swap = swap[this.key[i]];
            }

            return swap;
        } else {
            return data[(this.key as string)];
        }
    }

    private setField(obj, field) {
        if (typeof this.key !== 'string') {
            let swap = obj;

            for (let i = 0; i < this.key.length - 1; i++) {
                swap[this.key[i]] = swap[this.key[i]] || {};
                swap = swap[this.key[i]];
            }

            swap[this.key[this.key.length - 1]] = field;
        } else {
            obj[this.key as string] = field;
        }
    }
}

export abstract class AbstractParser<G> implements IParser {
    public abstract get config(): IRequestData<any>;

    private bodyPair: Pair;
    private paramPair: Pair;

    constructor() {
        this.initConfig();
    }

    private initConfig() {
        let internalConfig = this.config;
        const body: RequestField = internalConfig.body;
        const params: RequestField = internalConfig.params;

        if (params) {
            const paramKeys: Array<string> = Object.keys(params);
            let lastPair: Pair;

            paramKeys.forEach((key: string) => {
                if (params[key].length) {
                    params[key] = (params[key] as Array<IValidator>).sort((a: IValidator, b: IValidator): number => {
                        return a.priority - b.priority;
                    });

                    for (let i = 0; i < (params[key] as Array<IValidator>).length - 1; i++) {
                        params[key][i].next = params[key][i + 1];
                    }

                    const pair: Pair = new Pair(key, params[key][0], true);
                    // pair.key = key;
                    // pair.validator = params[key][0];

                    if (lastPair) {
                        lastPair.next = pair;
                    } else {
                        this.paramPair = pair;
                    }

                    lastPair = pair;
                } else {
                    // Impossible
                }
            });
        }

        if (body) {
            const bodyKeys: Array<string> = Object.keys(body);
            let lastPair: Pair;

            bodyKeys.forEach((key: string) => {
                if (body[key].length) {
                    body[key] = (body[key] as Array<IValidator>).sort((a: IValidator, b: IValidator): number => {
                        return a.priority - b.priority;
                    });

                    for (let i = 0; i < (body[key] as Array<IValidator>).length - 1; i++) {
                        body[key][i].next = body[key][i + 1];
                    }

                    const pair: Pair = new Pair(key, body[key][0]);
                    // pair.key = key;
                    // pair.validator = body[key][0];

                    if (lastPair) {
                        lastPair.next = pair;
                    } else {
                        this.bodyPair = pair;
                    }

                    lastPair = pair;
                } else {
                    const field: RequestField = body[key] as RequestField;
                    const fieldKeys: Array<string> = Object.keys(field);

                    const pair: Pair = new Pair(key, Validator.isRequired())

                    if (lastPair) {
                        lastPair.next = pair;
                    } else {
                        this.bodyPair = pair;
                    }
                    lastPair = pair;

                    fieldKeys.forEach((fieldKey: string) => {
                        if (field[fieldKey].length) {
                            field[fieldKey] = (field[fieldKey] as Array<IValidator>).sort((a: IValidator, b: IValidator): number => {
                                return a.priority - b.priority;
                            });

                            for (let i = 0; i < (field[fieldKey] as Array<IValidator>).length - 1; i++) {
                                field[fieldKey][i].next = field[fieldKey][i + 1];
                            }
                            const pair: Pair = new Pair([key, fieldKey], field[fieldKey][0]);
                            // pair.fieldKey = fieldKey;
                            // pair.validator = body[fieldKey][0];

                            if (lastPair) {
                                lastPair.next = pair;
                            } else {
                                this.bodyPair = pair;
                            }

                            lastPair = pair;
                        }
                    });
                }
            });
        }


    }

    private validate(pair: Pair, data, obj): boolean | Err {
        const result = pair.validate(data, obj);

        return result;
    }

    public parseRequest(request: Request): G | Err {
        let bodyResult: boolean | Err = true;
        let paramResult: boolean | Err = true;
        const obj: any = {};

        if (this.paramPair) {
            obj.params = {};
            paramResult = this.validate(this.paramPair, request.params, obj.params);

            if (paramResult !== true) {
                return <Err>paramResult;
            }
        }

        if (this.bodyPair) {
            obj.body = {};
            bodyResult = this.validate(this.bodyPair, request.body, obj.body);

            if (bodyResult !== true) {
                return <Err>bodyResult;
            }
        }

//         const theType = asValue({
//     body: {
//         id: []
//     },
//     params: {
//         id: [],
//         name: []
//     }
// });

// type Tax = IRequestData2<typeof theType>;

// const t: Tax = {
//     body: {
//         id: 'asd'
//     },
//     params: {
//         id: 'asd',
//         name: 10
//     }
// }

        // const ThisType = asValue(<any>this.config);
        // type Tol = IRequestData2<typeof ThisType>;


        return obj;
        // return bodyResult && paramResult;
    }

    /**
     * Validate and parse field that contains child fields
     * @param {Array<RequestField>} arr
     * @param parentData
     * @returns {any}
     */
    // public validateFields(arr: Array<RequestField>, parentData: any): any {
    //     if (arr) {
    //         let result = {};
    //         for (let index = 0; index < arr.length; index++) {
    //             let field: RequestField = arr[index];
    //             let validatedField: any;

    //             if (field && field.children) {
    //                 validatedField = this.validateFields(field.children, parentData[field.fieldName]);
    //             } else if (field && field.validators) {
    //                 validatedField = this.validateField(field, parentData)
    //             } else {
    //                 return new RequestError();
    //             }

    //             if (validatedField instanceof RequestError) {
    //                 return validatedField;
    //             } else if (validatedField != null) {
    //                 result[field.fieldName] = validatedField;
    //             }
    //         }

    //         return result;
    //     } else {
    //         return new RequestError();
    //     }
    // }

    /**
     * Validate and parse given field that does not contains other children
     * @param {RequestField} field
     * @param parentData
     * @returns {any}
     */
    // public validateField(field: RequestField, parentData: any): any {
    //     let validatedField: any;

    //     /** Check if the value is undefined or null but is also optional, so we can skip it */
    //     if (parentData[field.fieldName] === undefined || parentData[field.fieldName] == null) {
    //         for (let i: number = 0; i < field.validators.length; i++) {
    //             if (!field.validators[i].code) {
    //                 return null;
    //             }
    //         }
    //     }

    //     /** Validate the value */
    //     for (let i = 0; i < field.validators.length; i++) {
    //         const validation = field.validators[i].function(parentData[field.fieldName]);

    //         if (!validation) {
    //             return new RequestError(field.validators[i].message, field.fieldName, field.validators[i].code);
    //         }
    //     }

    //     // validatedField[field.fieldName] = parentData[field.fieldName];
    //     return parentData[field.fieldName];
    // }

    // public parseRequest(request: Request): any {
    //     /** We need it stored as local variable because if not it will run the code twice from config (it's a getter not an atribute) */
    //     const config: IRequestData = this.config;
    //     let parsedObject: any = {};

    //     /* Parse the body */
    //     // const body: Array<RequestField> = config.body || [];
    //     const body: RequestField = config.body;
    //     const params: RequestField = config.params;

    //     this.validate();
    //     // let resultBody: any = this.validateFields(body, request.body);

    //     if (resultBody instanceof RequestError) {
    //         return resultBody;
    //     }
    //     // parsedObject.body = resultBody;

    //     Object.assign(parsedObject, resultBody);

    //     /* Parse the params */
    //     // const params: Array<RequestField> = config.params || [];
    //     let resultParams: any = this.validateFields(params, request.body);
    //     if (resultParams instanceof RequestError) {
    //         return resultParams;
    //     }
    //     // parsedObject.params = resultParams;
    //     Object.assign(parsedObject, resultParams);

    //     return parsedObject;
    // }

    public parseResponse(data: any): any {
        return data;
    }

}

export abstract class AbstractTypeParser<T, G> extends AbstractParser<G> {
    protected modelParser: AbstractModelParser<T>;

    constructor() {
        super();
        this.modelParser = this.getModelParser();
    }

    protected abstract getModelParser(): AbstractModelParser<T>;
}
