import { IMethodCallProps, OpenMethodAPI } from './method';
import { IApiParams } from '../types/api';
import { callMethod } from './index';
import { IDatabaseBundle } from '../database';

type IParams = {
    a?: number;
    b?: number;
};

type IResult = number;

class Sum extends OpenMethodAPI<IParams, IResult> {
    public handleParams(params: IApiParams, props: IMethodCallProps): IParams {
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

    public perform(params: IParams, props: IMethodCallProps): Promise<IResult> {
        return Promise.resolve(params.a! + params.b!);
    }
}

const sum = new Sum({
    getDatabase: () => Promise.reject(),
});

const props: IMethodCallProps = {
    session: null,
    callMethod,
    database: {} as IDatabaseBundle,
};

describe('Method', () => {
    it('should call test API method and set default values for skipped params', async() => {
        expect(await sum.call({  }, props)).toEqual(6);
        expect(await sum.call({ a: 4 }, props)).toEqual(9);
        expect(await sum.call({ b: 4 }, props)).toEqual(5);
    });
});
