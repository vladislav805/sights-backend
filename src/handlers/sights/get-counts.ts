import { ICompanion, OpenMethodAPI } from '../method';
import { time } from '../../utils/time';
import { HOUR } from '../../date';

type IResult = {
    total: number;
    verified: number;
    archive: number;
    active: number;
};

const ttl = HOUR;

export default class SightsGetCounts extends OpenMethodAPI<never, IResult> {
    private cache?: IResult;
    private updated: number = 0;

    protected async perform(params: never, props: ICompanion): Promise<IResult> {
        if (time() - this.updated < ttl) {
            return this.cache!;
        }

        const [result] = await props.database.select<IResult>(
            'select \
(select count(*) from `sight`) as `total`,\
(select count(*) from `sight` where (`sight`.`mask` & 6) > 0) as `verified`,\
(select count(*) from `sight` where (`sight`.`mask` & 2) = 2) as `active`,\
(select count(*) from `sight` where (`sight`.`mask` & 4) = 4) as `archived`\
',
        );

        this.cache = result;
        this.updated = time();

        return result;
    }
}
