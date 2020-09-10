import { IUploadPhotoSizeKey } from '../config';

export type IUploadPhotoIdentity = {
    path: string;
    name: string;
}

export const createPhotoIdentity = (hash: string, sizeName: IUploadPhotoSizeKey): IUploadPhotoIdentity => ({
    path: `${hash.substring(0, 2)}/${hash.substring(2, 4)}`,
    name: `${hash.substr(-6)}.${sizeName}.jpg`
});
