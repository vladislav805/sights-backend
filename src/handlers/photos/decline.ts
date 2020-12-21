import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ISight } from '../../types/sight';

type IParams = {
    photoId: number;
    sightId: number;
};

export default class PhotosDecline extends PrivateMethodAPI<IParams, boolean> {
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

    protected async perform({ photoId, sightId }: IParams, companion: ICompanionPrivate): Promise<boolean> {
        const { database, session, callMethod } = companion;
        const sights = await database.select<ISight>('select * from `sight` where `sightId` = ?', [sightId]);

        if (sights.length !== 1) {
            throw new Error('Sight not found');
        }

        if (sights[0].ownerId !== session.userId) {
            throw new Error('Invalid method used');
        }

        return callMethod('photos.remove', { photoId, sightId });
    }
}
