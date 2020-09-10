import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { existsSync, unlinkSync } from 'fs';
import { IPhotoRaw } from '../../types/photo';
import { ApiError, ErrorCode } from '../../error';
import { getFullFilePath } from '../../uploader/utils/get-full-file-path';

type IParams = {
    photoId: number;
};

export default class PhotosRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICallPropsPrivate): IParams {
        const photoId = +params.photoId;

        if (!photoId) {
            throw new Error('Not specified photoId');
        }

        return { photoId };
    }


    protected async perform({ photoId }: IParams, { database, session }: ICallPropsPrivate): Promise<boolean> {
        const photos = await database.select<IPhotoRaw>(
            'select `path`, `photo200`, `photoMax` from `photo` where `photoId` = ? and `ownerId` = ?',
            [photoId, session.userId],
        );

        if (photos.length !== 1) {
            throw new ApiError(ErrorCode.ACCESS_DENIED, 'Access denied');
        }

        const photo = photos[0];

        [photo.photo200, photo.photoMax]
            .map(name => getFullFilePath(photo.path!, name))
            .filter(path => existsSync(path))
            .forEach(path => unlinkSync(path));

        const result = await database.apply(
            'delete from `photo` where `photoId` = ? and `ownerId` = ?',
            [photoId, session.userId],
        );

        return result.affectedRows > 0;
    }
}
