import { IMethodCallProps, OpenMethodAPI } from '../method';

export default class UtilsGetTime extends OpenMethodAPI<unknown, unknown> {
    public perform(params: unknown, props: IMethodCallProps): Promise<unknown> {
        return Promise.resolve((Date.now() / 1000) | 0);
    }
}
