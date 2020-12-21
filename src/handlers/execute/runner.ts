import * as vm from 'vm';
import { NodePath, transformSync } from '@babel/core';
import * as t from '@babel/types';
import { CallExpression, Identifier, MemberExpression, ObjectExpression } from '@babel/types';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import { ICompanion } from '../method';
import { col, concat } from './functions';

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

const RESERVED_INTERNAL_FUNCTION_NAME = 'callMethodInternal';

// noinspection JSUnusedGlobalSymbols
export const transformCode = (code: string) => transformSync(code, {
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
                // Получаем конструкцию вызова функции из идентификатора
                const caller = path.findParent(p => p.type === 'CallExpression') as NodePath<CallExpression>;

                // Если нет - не оно
                if (!caller) {
                    return;
                }

                // Если название идентификатора совпадает с секретной функцией
                // и идентификатор находится в вызове - удаляем это выражение
                if (
                    path.node.name === RESERVED_INTERNAL_FUNCTION_NAME &&
                    caller.node.callee === path.node
                ) {
                    caller.remove();
                    return;
                }

                // Если идентификатор начинается с API, то начинаем парсить,
                // ожидая, что там будет вызов вида API.***.***
                if (path.node.name === 'API') {
                    const callerExpr = caller.node; // весь вызов
                    const argsExpr = callerExpr.arguments; // аргументы функции
                    const args = argsExpr[0] ?? t.objectExpression([]) as ObjectExpression;


                    const callee = callerExpr.callee as MemberExpression;

                    // первая часть названия
                    const memberExpr = callee.object as MemberExpression;
                    const identExpr = memberExpr.property as Identifier;
                    const firstName = identExpr?.name;

                    // вторая часть названия
                    const identName= callee.property as Identifier;
                    const secondName = identName?.name;

                    const methodName = `${firstName}.${secondName}`;

                    if (caller) {
                        caller.replaceWith(
                            t.awaitExpression(
                                t.callExpression(
                                    t.identifier(RESERVED_INTERNAL_FUNCTION_NAME),
                                    [
                                        t.stringLiteral(methodName),
                                        args,
                                    ],
                                ),
                            ),
                        );
                        caller.skip();
                    }
                }
            },
            FunctionDeclaration: () => {
                throw new Error('Functions not supported');
            },
            ArrowFunctionExpression: () => {
                throw new Error('Functions not supported');
            },
            Loop: () => {
                throw new Error('loop not supported');
            },
            ForStatement: () => {
                throw new Error('for(;;) not supported');
            },
            ForInStatement: () => {
                throw new Error('for( in ) not supported');
            },
            ForOfStatement: () => {
                throw new Error('for( of ) not supported');
            },
            WhileStatement: () => {
                throw new Error('while not supported');
            },
            DoWhileStatement: () => {
                throw new Error('do-while not supported');
            },
            ImportDeclaration: () => {
                throw new Error('import not supported');
            },
            ExportNamedDeclaration: () => {
                throw new Error('export not supported');
            },
            TryStatement: () => {
                throw new Error('try-catch-finally not supported');
            },
            ThrowStatement: () => {
                throw new Error('throw not supported');
            },
            YieldExpression: () => {
                throw new Error('yield not supported');
            },
            ModuleDeclaration: () => {
                throw new Error('modules not supported');
            },
            ExportDeclaration: () => {
                throw new Error('export not supported');
            },
            Decorator: () => {
                throw new Error('decorators not supported');
            },
        },
    })],
})!.code!;


export const runExecute = (code: string, params: IApiParams, companion: ICompanion) => {
    try {
        code = transformCode(code);
    } catch (e) {
        console.error(e);
        throw new ApiError(ErrorCode.EXECUTE_INVALID_CODE, 'Code has error: ' + e.message);
    }

    const context = vm.createContext({
        A: params,
        [RESERVED_INTERNAL_FUNCTION_NAME]: (method: string, params: IApiParams) => {
            return !restrictedMethods.includes(method)
                ? companion.callMethod(method, params)
                : null;
        },
        col,
        concat,
    });

    vm.runInNewContext(`Object.defineProperty(A, '__result', { value: (async() => {${code}})(), enumerable: false });`, context, {
        filename: 'execute.js',
        timeout: 2000,
    });

    return context.A.__result;
};
