import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IPhotoRaw } from '../../types/photo';
import { ApiError, ErrorCode } from '../../error';
import { remoteCommand } from '../../utils/photos/remote-command';
import * as md5 from 'md5';
import config from '../../config';

type IParams = {
    photoId: number;
};

export default class PhotosRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const photoId = +params.photoId;

        if (!photoId) {
            throw new Error('Not specified photoId');
        }

        return { photoId };
    }


    protected async perform({ photoId }: IParams, { database, session }: ICompanionPrivate): Promise<boolean> {
        const photos = await database.select<IPhotoRaw>(
            'select `path`, `photo200`, `photoMax` from `photo` where `photoId` = ? and `ownerId` = ?',
            [photoId, session.userId],
        );

        if (photos.length !== 1) {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
        }

        const photo = photos[0];


        [photo.photo200, photo.photoMax].forEach(name => {
            const path = `${photo.path!}\n${name}`;

            remoteCommand('remove', {
                path,
                sig: md5(config.secret.UPLOAD_REMOVE + path),
            });
        });

        const result = await database.apply(
            'delete from `photo` where `photoId` = ? and `ownerId` = ?',
            [photoId, session.userId],
        );

        return result.affectedRows > 0;
    }
}
