import * as fs from 'fs';
import * as md5 from 'md5';
import { IncomingMessage, ServerResponse } from 'http';
import { RequestExtensions, ResponseExtensions } from 'restana';
import { Exifr } from 'exifr';
import { resolve } from 'path';
import { getConfigValue } from '../config';
import config, { IPhotoField } from './config';
import { drawWatermark } from './draw-watermark';
import { getUploadSignature } from '../utils/photos/upload-sig';
import { createImageFromFile } from './utils/create-image-from-file';
import { isRequiredSize } from './utils/is-required-size';
import { createPhotoIdentity, IUploadPhotoIdentity } from './utils/create-photo-identity';
import { resizeToMaxSideSize } from './utils/resize';
import fixOrientation from './utils/rotate';
import { base64encode } from '../utils/base64';
import { IUploadPayload } from './types';
import { PhotoType } from '../types/photo';

type IFile = {
    file?: Express.Multer.File;
};

export default async function handleUpload(req: IncomingMessage & RequestExtensions & IFile, res: ServerResponse & ResponseExtensions) {
    try {
        const { sig, k, s } = req.query;
        const type: PhotoType = +req.query.type;

        const actualSignature = getUploadSignature(+type, +k, s as string);

        if (sig !== actualSignature) {
            throw new Error('Invalid signature');
        }

        const file = req.file!;

        if (!file) {
            throw new Error('File not specified');
        }

        let image = await createImageFromFile(file.path, file.originalname);

        if (!isRequiredSize(image, type)) {
            throw new Error('Smallest side of image must me greater than TODO');
        }

        const sizes = {} as Record<IPhotoField, IUploadPhotoIdentity>;

        const hash = file.filename;
        const result: IUploadPayload = {
            sizes,
            type,
            path: hash,
            width: -1,
            height: -1,
        };

        const exr = new Exifr({
            gps: true,
            translateKeys: false,
        });

        await exr.read(file.path);
        const exif = await exr.parse();

        image = await fixOrientation(image, exif);

        if ('latitude' in exif && 'longitude' in exif) {
            result.latitude = exif.latitude;
            result.longitude = exif.longitude;
        }

        for (const { size, name, quality, key, max, needWatermark } of config.variants) {
            // Объект с полями path и name
            const pathInfo = createPhotoIdentity(hash, name);

            // Полный путь
            const dirPath = resolve(config.directory.loaded, pathInfo.path);

            // Если не существует - создать
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Полный путь до будущего изображения
            const imagePath = resolve(dirPath, pathInfo.name);

            // Ресайзим до нужного качества/размера (варианта)
            const resized = await resizeToMaxSideSize(image, size);

            if (needWatermark) {
                drawWatermark(resized, config.watermark);
            }

            await resized.saveJpeg(imagePath, quality);

            if (max) {
                result.width = resized.width;
                result.height = resized.height;
            }

            sizes[key] = pathInfo;
        }

        image.destroy();

        const payload = base64encode(JSON.stringify(result));

        res.send({
            payload,
            sig: md5(payload + getConfigValue('SECRET_SAVE')),
        });
    } catch (e) {
        console.log(e);
        res.send({ error: e.toString() });
    }
}
