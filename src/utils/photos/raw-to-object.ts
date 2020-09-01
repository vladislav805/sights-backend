import { IPhoto, IPhotoRaw } from '../../types/photo';
import { joinPhotoPath } from './join-path';
import { getConfigValue } from '../../config';

const raw2object = (raw: IPhotoRaw): IPhoto => {
    const path = raw.path!;
    delete raw.path;
    return {
        ...raw,
        photo200: joinPhotoPath(getConfigValue<string>('DOMAIN_MEDIA'), path, raw.photo200),
        photoMax: joinPhotoPath(getConfigValue<string>('DOMAIN_MEDIA'), path, raw.photoMax),
    };
};

export default raw2object;
