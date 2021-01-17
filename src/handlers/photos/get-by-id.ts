import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IPhoto, IPhotoRaw } from '../../types/photo';
import raw2object from '../../utils/photos/raw-to-object';
import { paramToArrayOf } from '../../utils/param-to-array-of';

type IParam = {
    photoIds: number[];
};

export default class PhotosGetById extends OpenMethodAPI<IParam, IPhoto[]> {
    protected handleParams(params: IApiParams, props: ICompanion): IParam {
        const photoIds = paramToArrayOf(params.photoIds, Number).filter(val => !isNaN(val));

        if (!photoIds.length) {
            throw new Error('Not specified photoIds');
        }

        return { photoIds };
    }

    protected async perform({ photoIds }: IParam, { database }: ICompanion): Promise<IPhoto[]> {
        const sql = 'select * from `photo` where `photo`.`photoId` in (?)';
        const items = await database.select<IPhotoRaw>(sql, [photoIds]);

        return items.map(raw2object);
    }
}
