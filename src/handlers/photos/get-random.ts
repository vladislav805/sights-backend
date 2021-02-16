import { ICompanion, ICompanionPrivate, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IPhoto, IPhotoRaw, PhotoType } from '../../types/photo';
import raw2object from '../../utils/photos/raw-to-object';
import { clamp } from '../../utils/clamp';
import { toNumber } from '../../utils/to-number';
import { unsafeRandomInt } from '../../utils/unsafe-random';
import { shuffle } from '../../utils/shuffle';

type IParam = {
    count: number;
};

type SightId = { sightId: number };
type Item = {
    sightId: number;
    photo: IPhoto;
};

export default class PhotosGetRandom extends OpenMethodAPI<IParam, Item[]> {
    private list: Item[];

    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParam {
        return {
            count: clamp(toNumber(params.count, 4), 1, 20),
        };
    }

    private async fetchList(companion: ICompanion): Promise<Item[]> {
        const sql = `select
    \`photo\`.*,
    \`sight\`.\`sightId\`
from
    \`photo\`
        left join \`sightPhoto\` on \`sightPhoto\`.\`photoId\` = \`photo\`.\`photoId\`
        left join \`sight\` on \`sight\`.\`sightId\` = \`sightPhoto\`.\`sightId\`
where
        \`photo\`.\`type\` = ? and \`photo\`.\`width\` > 1000 and \`photo\`.\`height\` > 1000 and
        (\`sight\`.\`mask\` & 2) > 0
limit ?`;

        const items = await companion.database.select<IPhotoRaw & SightId>(sql, [PhotoType.SIGHT, 1000]);

        this.list = items.map(raw2object).map((item: IPhoto & SightId) => ({
            sightId: item.sightId,
            photo: {
                ...item,
                sightId: undefined,
            },
        })) as Item[];

        return this.list;
    }

    protected async perform({ count }: IParam, companion: ICompanion): Promise<Item[]> {
        if (!this.list) {
            await this.fetchList(companion);
        }

        shuffle(this.list);

        const end = this.list.length - count - 1;
        const offset = unsafeRandomInt(0, end);

        return this.list.slice(offset, offset + count);
    }
}
