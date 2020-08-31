import { IMethodCallProps, OpenMethodAPI } from '../method';

export default class UtilsGetTime extends OpenMethodAPI<unknown, number> {
    protected perform(params: unknown, props: IMethodCallProps): Promise<number> {
        return Promise.resolve((Date.now() / 1000) | 0);
    }
}
