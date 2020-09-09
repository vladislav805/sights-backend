import { ICallPropsPrivate, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IPhoto, IPhotoRaw, PhotoType } from '../../types/photo';
import raw2object from '../../utils/photos/raw-to-object';
import { clamp } from '../../utils/clamp';

type IParam = {
    count: number;
    offset: number;
};

export default class PhotosGetUnsorted extends OpenMethodAPI<IParam, IPhoto[]> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParam {
        return {
            count: clamp(+params.count || 50, 1, 100),
            offset: +params.offset || 0,
        };
    }

    protected async perform({ offset, count }: IParam, { database }: ICallPropsPrivate): Promise<IPhoto[]> {
        const sql = `
select *
from \`photo\`
where \`type\` = ? and not exists (
    select \`photoId\`
    from \`sightPhoto\` 
    where \`sightPhoto\`.\`photoId\` = \`photo\`.\`photoId\`
) limit ?, ?`;

        const items = await database.select<IPhotoRaw>(sql, [PhotoType.SIGHT, offset, count]);

        return items.map(raw2object);
    }
}
