import { ISession } from '../types/session';
import { IApiParams } from '../types/api';
import { IDatabaseBundle } from '../database';
import { callMethod } from './index';

export interface IMethodProps {

}

export interface IMethodCallProps<Session = null> {
    session: Session;
    callMethod: typeof callMethod;
    database: IDatabaseBundle;
}

export type ICallPropsOpen = IMethodCallProps<ISession | null>;
export type ICallPropsPrivate = IMethodCallProps<ISession>;

export interface IMethodAPI<Params = unknown, Result = unknown, Session = unknown> {
    call(params: IApiParams, props: IMethodCallProps<Session>): Promise<Result>;
    /** @deprecated */
}

abstract class Method<
    Params = {},
    Result = unknown,
    Session = null,
> implements IMethodAPI<Params, Result, Session> {
    protected readonly props: IMethodProps;

    /**
     * Метод API создаётся при старте сервера
     * Здесь передаётся коннект к БД
     * @param props Параметры для инициализации метода
     */
    public constructor(props: IMethodProps) {
        this.props = props;
    }

    /**
     * Вызов метода API
     * @param paramsRaw Параметры метода, переданные при запросе
     * @param props Готовые параметры запроса, такие как сессия
     */
    public call(paramsRaw: IApiParams, props: IMethodCallProps<Session>): Promise<Result> {
        const params: Params = this.handleParams(paramsRaw, props);
        return this.perform(params, props);
    }

    /**
     * Проверка и обработка ошибок в переданных параметрах метода API, а также возможная
     * модификация, например, подстановка значений по умолчанию. В случае наличия ошибки
     * в параметрах следует выбрасывать исключение с описанием ошибки
     * @param params Параметры запроса, переданные пользователем
     * @param props Параметры запроса, такие как сессия
     * @returns Параметры запроса, которые будет ожидать метод
     */
    protected handleParams(params: IApiParams, props: IMethodCallProps<Session>): Params {
        return params as unknown as Params;
    }

    /**
     * Основная суть метода
     * При наличии ошибок при выполнении
     * @param params Параметры запроса, которые ожидает метод (предварительно прогнанные
     * через handleParams)
     * @param props Готовые параметры запроса, такие как сессия и кэши
     */
    protected abstract perform(params: Params, props: IMethodCallProps<Session>): Promise<Result>;

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
export abstract class OpenMethodAPI<P, R> extends Method<P, R, ISession | null> {
}

/**
 * Закрытый метод
 * Метод, который можно выполнить только авторизованным пользователем с передачей authKey
 */
export abstract class PrivateMethodAPI<P, R> extends Method<P, R, ISession> {
    protected abstract perform(params: P, props: ICallPropsPrivate): Promise<R>;
}
