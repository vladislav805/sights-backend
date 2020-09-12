import * as vm from 'vm';
import * as babel from '@babel/core';
import * as t from '@babel/types';
import { IApiParams } from '../../types/api';
import { callMethod } from '..';
import { ApiError, ErrorCode } from '../../error';

let API;

export const initExecuteApiObject = (methodNames: string[]) => {
    API = methodNames.filter(name => name !== 'execute').reduce((acc, method) => {
        const [section, name] = method.split('.');

        if (!(section in acc)) {
            Object.defineProperty(acc, section, {
                value: {},
                enumerable: false,
            });
        }

        Object.defineProperty(acc[section], name, {
            value: (params: any) => callMethod(method, params),
            writable: false,
            enumerable: false,
        });

        return acc;
    }, {});
};

const col = <T>(obj: T[], key: keyof T): T[keyof T][] => {
    if (!Array.isArray(obj)) {
        return [];
    }

    if (!key) {
        return Array(obj.length).fill(null);
    }

    return obj.map(item => item[key]);
};

export const transformCode = (code: string) => babel.transformSync(code, {
    parserOpts: {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
    },
    generatorOpts: {
        minified: true,
    },
    plugins: [() => ({
        visitor: {
            Identifier: (path: babel.NodePath<babel.types.Identifier>) => {
                if (path.node.name === 'API') {
                    const caller = path.findParent(p => p.type === 'CallExpression');

                    if (caller) {
                        caller.replaceWith(t.awaitExpression(caller.node as t.CallExpression));
                        caller.skip();
                    }
                }
            },
        },
    })],
})!.code!;


export const runExecute = (code: string, params: IApiParams) => {
    try {
        code = transformCode(code);
    } catch (e) {
        throw new ApiError(ErrorCode.EXECUTE_INVALID_CODE, 'Code has error: ' + e.message);
    }

    const context = vm.createContext({
        A: params,
        API,
        col,
    });

    vm.runInNewContext(`Object.defineProperty(A, '__result', { value: (async() => {${code}})(), enumerable: false });`, context, {
        filename: 'execute.js',
    });

    return context.A.__result;
};
