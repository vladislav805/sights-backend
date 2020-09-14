import { ICallPropsPrivate, PrivateMethodAPI } from '../method';
import { IPhoto, IPhotoRaw } from '../../types/photo';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';
import * as md5 from 'md5';
import { getConfigValue } from '../../config';
import { IUploadPayload } from '../../uploader/types';
import savePhotoPermanent from '../../uploader/save';
import raw2object from '../../utils/photos/raw-to-object';
import { base64decode } from '../../utils/base64';
import { wrapIdentify } from '../../utils/sql-packer-id';
import { time } from '../../utils/time';

type IParams = {
    payload: IUploadPayload;
};

export default class PhotosSave extends PrivateMethodAPI<IParams, IPhoto> {
    protected handleParams({ payload, sig }: IApiParams, props: ICallPropsPrivate): IParams {
        // noinspection SuspiciousTypeOfGuard
        if (typeof payload !== 'string') {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter payload is missing');
        }

        if (typeof sig !== 'string') {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Parameter sig is missing');
        }

        if (md5(payload + getConfigValue('SECRET_SAVE')) !== sig) {
            throw new ApiError(ErrorCode.PHOTO_SAVE_ERROR_SIG, 'Invalid payload with sig');
        }

        return { payload: JSON.parse(base64decode(payload)) };
    }

    protected async perform({ payload }: IParams, props: ICallPropsPrivate): Promise<IPhoto> {
        const { sizes, ...rest } = payload;

        await savePhotoPermanent(sizes);

        rest.path = sizes.photoMax.path;
        rest.ownerId = props.session.userId;
        rest.date = time();

        Object.keys(sizes).forEach(key => rest[key] = sizes[key].name);
        const columns = Object.keys(rest).map(wrapIdentify);
        const values = Object.values(rest);
        const placeholders = Array(values.length).fill('?').join(', ');

        const insertQuery = await props.database.apply(
            `insert into \`photo\` (${columns}) values (${placeholders})`,
            values,
        );

        const photo = await props.database.select<IPhotoRaw>(
            'select * from `photo` where `photoId` = ?',
            [insertQuery.insertId],
        );

        return raw2object(photo[0]);
    }
}
// delete 1494