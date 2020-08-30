import * as mysql from 'promise-mysql';
import { ISession } from '../types/session';
import { IApiParams } from '../types/api';

export interface IMethodProps {
    getDatabase: () => Promise<mysql.Connection>;
}

export interface IMethodCallProps {
    session: ISession | null;
}

export interface IMethodAPI<Params = unknown, Result = unknown> {
    call(params: IApiParams, props: IMethodCallProps): Promise<Result>;
    needSession(): boolean;
}

abstract class Method<Params = {}, Result = unknown> implements IMethodAPI<Params, Result> {
    protected readonly props: IMethodProps;

    /**
     * Метод API создаётся при старте сервера
     * Здесь передаётся коннект к БД
     * @param props Параметры для инициализации метода
     */
    public constructor(props: IMethodProps) {
        this.props = props;
    }

    protected getDatabase(): Promise<mysql.Connection> {
        return this.props.getDatabase();
    }

    /**
     * Вызов метода API
     * @param params Параметры метода, переданные при запросе
     * @param props Готовые параметры запроса, такие как сессия
     */
    public call(params: IApiParams, props: IMethodCallProps): Promise<Result> {
        return this.perform(this.handleParams(params, props), props);
    }

    /**
     * Проверка и обработка ошибок в переданных параметрах метода API, а также возможная
     * модификация, например, подстановка значений по умолчанию. В случае наличия ошибки
     * в параметрах следует выбрасывать исключение с описанием ошибки
     * @param params Параметры запроса, переданные пользователем
     * @param props Параметры запроса, такие как сессия
     * @returns Параметры запроса, которые будет ожидать метод
     */
    public handleParams(params: IApiParams, props: IMethodCallProps): Params {
        return params as unknown as Params;
    }

    /**
     * Основная суть метода
     * При наличии ошибок при выполнении
     * @param params Параметры запроса, которые ожидает метод (предварительно прогнанные
     * через handleParams)
     * @param props Готовые параметры запроса, такие как сессия и кэши
     */
    public abstract perform(params: Params, props: IMethodCallProps): Promise<Result>;

    /**
     * Нужна ли информация о сессии для работы метода?
     */
    public needSession(): boolean {
        return true;
    }

    public toString(): string {
        return `[Method: ${this.constructor.name}]`;
        /*
        .replace(/^([A-Za-z]+)([A-Z])/, (a: string, b: string) => {
            return `${a.toLowerCase()}.${b.toLowerCase()}`;
        })
        */
    }
}

/**
 * Открытый метод
 * Метод, который может быть вызван всегда от любого пользователя
 */
export abstract class OpenMethodAPI<P, R> extends Method<P, R> {
}

/**
 * Закрытый метод
 * Метод, который можно выполнить только авторизованным пользователем с передачей authKey
 */
export abstract class PrivateMethodAPI<P, R> extends Method<P, R> {
    public handleParams(params: Record<keyof P, string>, props: IMethodCallProps): P {
        if (!('authKey' in params)) {
            throw new Error('User authorization failed: authKey not specified');
        }

        if (!props.session) {
            throw new Error('User authorization failed: authKey is invalid');
        }

        return params as P;
    }
}
