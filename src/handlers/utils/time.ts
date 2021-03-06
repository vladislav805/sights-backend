import { ICompanion, OpenMethodAPI } from '../method';
import { time } from '../../utils/time';

export default class UtilsGetTime extends OpenMethodAPI<unknown, number> {
    protected perform(params: unknown, props: ICompanion): Promise<number> {
        return Promise.resolve(time());
    }
}
