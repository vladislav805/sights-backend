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
    highlightCode: false,
    parserOpts: {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
    },
    generatorOpts: {
        minified: true,
    },
    plugins: [() => ({
        visitor: {
            Identifier: (path: babel.NodePath<t.Identifier>) => {
                if (path.node.name === 'API') {
                    const caller = path.findParent(p => p.type === 'CallExpression');

                    if (caller) {
                        caller.replaceWith(t.awaitExpression(caller.node as t.CallExpression));
                        caller.skip();
                    }
                }
            },
            FunctionDeclaration: (path: babel.NodePath<t.FunctionDeclaration>) => {
                throw new Error('Functions not supported');
            },
            ArrowFunctionExpression: (path: babel.NodePath<t.ArrowFunctionExpression>) => {
                throw new Error('Functions not supported');
            },
            ForStatement: (path: babel.NodePath<t.ForStatement>) => {
                throw new Error('for(;;) not supported');
            },
            ForInStatement: (path: babel.NodePath<t.ForInStatement>) => {
                throw new Error('for( in ) not supported');
            },
            ForOfStatement: (path: babel.NodePath<t.ForOfStatement>) => {
                throw new Error('for( of ) not supported');
            },
            WhileStatement: (path: babel.NodePath<t.WhileStatement>) => {
                throw new Error('while not supported');
            },
            DoWhileStatement: (path: babel.NodePath<t.DoWhileStatement>) => {
                throw new Error('do-while not supported');
            },
            ImportDeclaration: (path: babel.NodePath<t.ImportDeclaration>) => {
                throw new Error('import not supported');
            },
            ExportNamedDeclaration: (path: babel.NodePath<t.ExportNamedDeclaration>) => {
                throw new Error('export not supported');
            },
            TryStatement: (path: babel.NodePath<t.TryStatement>) => {
                throw new Error('try-catch-finally not supported');
            },
            ThrowStatement: (path: babel.NodePath<t.ThrowStatement>) => {
                throw new Error('throw not supported');
            },
            YieldExpression: (path: babel.NodePath<t.YieldExpression>) => {
                throw new Error('yield not supported');
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
        timeout: 2000,
    });

    return context.A.__result;
};
