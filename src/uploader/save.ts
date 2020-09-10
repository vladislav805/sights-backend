import { IUploadPhotoIdentity } from './utils/create-photo-identity';
import { resolve } from 'path';
import { existsSync, mkdirSync, renameSync } from 'fs';
import config, { IUploadPhotoSizeKey } from './config';
import { ApiError, ErrorCode } from '../error';
import { getFullFilePath } from './utils/get-full-file-path';

export default function saveFile(sizes: Record<IUploadPhotoSizeKey, IUploadPhotoIdentity>): void {
    Object.keys(sizes).forEach((key: IUploadPhotoSizeKey) => {
        const item = sizes[key];

        const fullPath = resolve(config.directory.permanent, item.path);

        if (!existsSync(fullPath)) {
            mkdirSync(fullPath, { recursive: true });
        }

        const tempPath = resolve(config.directory.loaded, item.path, item.name);
        const filePath = getFullFilePath(item.path, item.name);

        if (!existsSync(tempPath)) {
            throw new ApiError(ErrorCode.PHOTO_SAVE_ERROR_NOT_EXISTS, 'File not found');
        }

        renameSync(tempPath, filePath);
    });
}
