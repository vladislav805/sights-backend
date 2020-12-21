import { ISession } from '../types/session';
import { IApiParams } from '../types/api';
import { IDatabaseBundle } from '../database';

export type IMethodProps = never;

export type ICompanion<Session = ISession | null> = {
    session: Session;
    callMethod<T = unknown>(method: string, params: IApiParams): Promise<T>;
    database: IDatabaseBundle;
};
export type ICompanionPrivate = ICompanion<ISession>;

export interface IMethodAPI<Params = unknown, Result = unknown> {
    call(params: IApiParams, props: ICompanion): Promise<Result>;
}

abstract class Method<Params = {}, Result = unknown> implements IMethodAPI<Params, Result> {
    protected readonly props: IMethodProps;

    /**
     * Метод API создаётся при старте сервера
     * @param props Параметры для инициализации метода (их нет!)
     */
    public constructor(props: IMethodProps) {
        this.props = props;
    }

    /**
     * Вызов метода API
     * @param paramsRaw Параметры метода, переданные при запросе
     * @param companion Информация, которая может быть полезна при работе метода
     *                  Например, информация о сессии и объект для работы с БД
     */
    public call(paramsRaw: IApiParams, companion: ICompanion): Promise<Result> {
        const params: Params = this.handleParams(paramsRaw, companion);
        return this.perform(params, companion);
    }

    /**
     * Проверка и обработка ошибок в переданных параметрах метода API, а также возможная
     * модификация, например, подстановка значений по умолчанию или парсинг в более
     * удобные структуры. В случае наличия ошибки в параметрах следует выбрасывать
     * исключение с описанием ошибки
     * @param params Параметры запроса, переданные пользователем
     * @param companion Параметры запроса, такие как сессия
     * @returns Параметры запроса, которые будет ожидать метод
     */
    protected handleParams(params: IApiParams, companion: ICompanion): Params {
        return params as unknown as Params;
    }

    /**
     * Основная суть метода
     * При наличии ошибок при выполнении выбрасывается исключение ApiError
     * @param params Параметры запроса, которые ожидает метод (предварительно прогнанные
     * через handleParams)
     * @param companion Готовые параметры запроса, такие как сессия и кэши
     */
    protected abstract perform(params: Params, companion: ICompanion): Promise<Result>;

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
    protected abstract perform(params: P, companion: ICompanionPrivate): Promise<R>;
}
