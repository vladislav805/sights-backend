import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';
import { PhotoType } from '../../types/photo';

type IParams = {
    photoId: number;
    sightId: number;
};

export default class PhotosSuggest extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const photoId = +params.photoId;
        const sightId = +params.sightId;

        if (!photoId) {
            throw new Error('Not specified photoId');
        }

        if (!sightId) {
            throw new Error('Not specified sightId');
        }

        return { photoId, sightId };
    }

    protected async perform({ photoId, sightId }: IParams, { database, session }: ICompanionPrivate): Promise<boolean> {
        const sights = await database.select<ISight>('select * from `sight` where `sightId` = ?', [sightId]);

        if (sights.length !== 1) {
            throw new Error('Sight not found');
        }

        if (sights[0].ownerId === session.userId) {
            throw new Error('Invalid method used');
        }

        const result = await database.apply(
            'insert into `sightPhoto` (`sightId`, `photoId`, `orderId`) select ? as `sightId`, `photoId`, (select count(*) from `sightPhoto` where `sightId` = ?) as `count` from `photo` where `photoId` = ? and `type` = ?',
            [sightId, sightId, photoId, PhotoType.SUGGEST],
        );

        return result.affectedRows > 0;
    }
}
