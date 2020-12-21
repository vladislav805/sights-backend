import { ICompanion, OpenMethodAPI } from './method';
import { IApiParams } from '../types/api';
import { callMethod } from './index';
import { IDatabaseBundle } from '../database';

type IParams = {
    a?: number;
    b?: number;
};

type IResult = number;

class Sum extends OpenMethodAPI<IParams, IResult> {
    public handleParams(params: IApiParams, props: ICompanion): IParams {
        if (!params.a) {
            params.a = 1;
        }

        if (!params.b) {
            params.b = 5;
        }

        return {
            a: +params.a,
            b: +params.b,
        };
    }

    public perform(params: IParams, props: ICompanion): Promise<IResult> {
        return Promise.resolve(params.a! + params.b!);
    }
}

const sum = new Sum(null as never);

const companion: ICompanion = {
    session: null,
    callMethod: (method, params) => callMethod(method, params, companion),
    database: {} as IDatabaseBundle,
};

describe('Method', () => {
    it('should call test API method and set default values for skipped params', async() => {
        expect(await sum.call({  }, companion)).toEqual(6);
        expect(await sum.call({ a: 4 }, companion)).toEqual(9);
        expect(await sum.call({ b: 4 }, companion)).toEqual(5);
    });
});
