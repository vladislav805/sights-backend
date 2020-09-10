import { ICallPropsOpen, OpenMethodAPI } from '../method';
import { IApiList, IApiParams } from '../../types/api';
import { IPhoto, IPhotoRaw } from '../../types/photo';
import raw2object from '../../utils/photos/raw-to-object';

type IParam = {
    sightId: number;
};

export default class PhotosGet extends OpenMethodAPI<IParam, IApiList<IPhoto>> {
    protected handleParams(params: IApiParams, props: ICallPropsOpen): IParam {
        const sightId = +params.sightId;

        if (!sightId || sightId <= 0) {
            throw new Error('Invalid sightId');
        }

        return { sightId };
    }

    protected async perform({ sightId }: IParam, { database }: ICallPropsOpen): Promise<IApiList<IPhoto>> {
        const sql = 'select `photo`.* from `sightPhoto` left join `photo` on `sightPhoto`.`photoId` = `photo`.`photoId` where  `sightPhoto`.`sightId` = ?';
        const items = await database.select<IPhotoRaw>(sql, [sightId]);

        return {
            count: items.length,
            items: items.map(raw2object),
        };
    }
}
