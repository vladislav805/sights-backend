import { ICallPropsOpen, OpenMethodAPI } from '../method';

export default class UtilsGetTime extends OpenMethodAPI<unknown, number> {
    protected perform(params: unknown, props: ICallPropsOpen): Promise<number> {
        return Promise.resolve((Date.now() / 1000) | 0);
    }
}
