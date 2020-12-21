import * as vm from 'vm';
import { NodePath, transformSync } from '@babel/core';
import * as t from '@babel/types';
import { AwaitExpression, CallExpression, Identifier, MemberExpression, ObjectExpression } from '@babel/types';
import { IApiParams } from '../../types/api';
import { callMethod } from '..';
import { ApiError, ErrorCode } from '../../error';

let API;

const restrictedMethods = [
    'execute',
    'account.create',
    'account.activate',
    'account.authorize',
    'account.changePassword',
    'account.setProfilePhoto',
    'users.follow',
    'sights.remove',
    'photos.getUploadUri',
    'photos.remove',
    'photos.suggest',
    'comments.add',
];

export const initExecuteApiObject = (methodNames: string[]) => {
    API = methodNames.filter(name => !restrictedMethods.includes(name)).reduce((acc, method) => {
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

function concat() {
    return Array.from(arguments).reduce((acc, item) => {
        if (Array.isArray(item)) {
            acc.splice(acc.length, 0, ...item);
        } else {
            acc.splice(acc.length, 0, item);
        }
        return acc;
    }, []);
}

// noinspection JSUnusedGlobalSymbols
export const transformCode = (code: string, authKey?: string | undefined) => transformSync(code, {
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
            Identifier: (path: NodePath<Identifier>) => {
                if (path.node.name === 'API') {
                    const caller = path.findParent(p => p.type === 'CallExpression');

                    if (caller) {
                        caller.replaceWith(t.awaitExpression(caller.node as CallExpression));
                        caller.skip();
                    }
                }
            },
            ObjectExpression: (path: NodePath<ObjectExpression>) => {
                if (!authKey) {
                    return;
                }

                // когда дело доходит до объекта, await перед вызовом уже вставляется
                // и CallExpression оборачивается в AwaitExpression
                const awaitExpr = path.findParent(p => p.type === 'AwaitExpression') as NodePath<AwaitExpression>;

                if (!awaitExpr) {
                    return;
                }

                const callExpr = awaitExpr.node.argument as CallExpression; // API.sights.getById({sightIds:i,fields:A.sf})
                const callee = callExpr?.callee as MemberExpression; // API.sights.getById
                const methodName = callee?.object as MemberExpression; // API.sights
                const methodSect = methodName?.object as Identifier; // API

                if (methodSect.name === 'API') {
                    path.node.properties.push(
                        t.objectProperty(
                            t.identifier('authKey'),
                            t.stringLiteral(authKey),
                        ),
                    );
                }
            },
            FunctionDeclaration: (path: NodePath<t.FunctionDeclaration>) => {
                throw new Error('Functions not supported');
            },
            ArrowFunctionExpression: (path: NodePath<t.ArrowFunctionExpression>) => {
                throw new Error('Functions not supported');
            },
            Loop: (path: NodePath<t.Loop>) => {
                throw new Error('loop not supported');
            },
            ForStatement: (path: NodePath<t.ForStatement>) => {
                throw new Error('for(;;) not supported');
            },
            ForInStatement: (path: NodePath<t.ForInStatement>) => {
                throw new Error('for( in ) not supported');
            },
            ForOfStatement: (path: NodePath<t.ForOfStatement>) => {
                throw new Error('for( of ) not supported');
            },
            WhileStatement: (path: NodePath<t.WhileStatement>) => {
                throw new Error('while not supported');
            },
            DoWhileStatement: (path: NodePath<t.DoWhileStatement>) => {
                throw new Error('do-while not supported');
            },
            ImportDeclaration: (path: NodePath<t.ImportDeclaration>) => {
                throw new Error('import not supported');
            },
            ExportNamedDeclaration: (path: NodePath<t.ExportNamedDeclaration>) => {
                throw new Error('export not supported');
            },
            TryStatement: (path: NodePath<t.TryStatement>) => {
                throw new Error('try-catch-finally not supported');
            },
            ThrowStatement: (path: NodePath<t.ThrowStatement>) => {
                throw new Error('throw not supported');
            },
            YieldExpression: (path: NodePath<t.YieldExpression>) => {
                throw new Error('yield not supported');
            },
            ModuleDeclaration: (path: NodePath<t.ModuleDeclaration>) => {
                throw new Error('modules not supported');
            },
            ExportDeclaration: (path: NodePath<t.ExportDeclaration>) => {
                throw new Error('export not supported');
            },
            Decorator: (path: NodePath<t.Decorator>) => {
                throw new Error('decorators not supported');
            },
        },
    })],
})!.code!;


export const runExecute = (code: string, params: IApiParams) => {
    try {
        code = transformCode(code, params.authKey);
    } catch (e) {
        throw new ApiError(ErrorCode.EXECUTE_INVALID_CODE, 'Code has error: ' + e.message);
    }

    const context = vm.createContext({
        A: params,
        API,
        col,
        concat,
    });

    vm.runInNewContext(`Object.defineProperty(A, '__result', { value: (async() => {${code}})(), enumerable: false });`, context, {
        filename: 'execute.js',
        timeout: 2000,
    });

    return context.A.__result;
};
