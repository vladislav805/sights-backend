import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { runExecute } from './runner';

type IParams = {
    code: string;
    params: IApiParams;
};

export default class Execute extends OpenMethodAPI<IParams, unknown> {
    protected handleParams({ code, ...params }: IApiParams, props: ICallPropsOpen): IParams {
        return { code: code as string, params };
    }

    protected async perform({ code, params }: IParams, props: ICallPropsOpen): Promise<unknown> {
        return runExecute(code, params);
    }
}
