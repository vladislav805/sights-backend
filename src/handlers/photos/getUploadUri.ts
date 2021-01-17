import * as qs from 'querystring';
import config from '../../config';
import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { PhotoType } from '../../types/photo';
import { IApiParams } from '../../types/api';
import { isValidPhotoType } from '../../utils/photos/is-valid-type';
import { getUploadSignature } from '../../utils/photos/upload-sig';
import { toNumber } from '../../utils/to-number';

type IParams = {
    type: PhotoType;
    authKey: string;
};

type IUploadPhotoDest = {
    uri: string;
};

export default class PhotosGetUploadUri extends PrivateMethodAPI<IParams, IUploadPhotoDest> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const type = toNumber(params.type, 'type');

        if (!isValidPhotoType(type)) {
            throw new Error('Invalid type');
        }

        return { type, authKey: params.authKey! };
    }

    protected async perform({ type, authKey }: IParams, props: ICompanionPrivate): Promise<IUploadPhotoDest> {
        const x = Math.random();
        const k = Math.floor(Date.now() * x);
        const s = authKey.split('').map(i => i.charAt(0) + Math.floor(x * 4)).join('');
        const sig = getUploadSignature(type, k, s);
        const query = qs.stringify({ type, sig, k, s });

        return {
            uri: `https://${config.domain.MEDIA}/upload?${query}`,
        };
    }
}
