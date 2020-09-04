import { IncomingMessage, ServerResponse } from 'http';
import { RequestExtensions, ResponseExtensions } from 'restana';
import { getUploadSignature } from '../utils/photos/upload-sig';
import { PhotoType } from '../types/photo';
import { createImageFromFile } from './utils/create-image-from-file';
import { isRequiredSize } from './utils/is-required-size';
import { drawWatermark } from './draw-watermark';
import config from './config';
import { resolve } from 'path';
import * as fs from 'fs';
import { createPhotoIdentity, IUploadPhotoIdentity } from './utils/create-photo-identity';
import { resizeToMaxSideSize } from './utils/resize';

interface MulterFile {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
}

type IFile = {
    file?: MulterFile;
};

export default async function handleUpload(req: IncomingMessage & RequestExtensions & IFile, res: ServerResponse & ResponseExtensions) {
    const { sig, k, s } = req.query;
    const type: PhotoType = +req.query.type;

    const actualSignature = getUploadSignature(+type, +k, s as string);

    try {
        /*if (sig !== actualSignature) {
            throw new Error('Invalid signature');
        }*/

        const file = req.file;

        if (!file) {
            throw new Error('File not specified');
        }

        let image = await createImageFromFile(file.path, file.originalname);

        if (!isRequiredSize(image, type)) {
            throw new Error('Smallest side of image must me greater than TODO');
        }

        const sizes: Record<string, IUploadPhotoIdentity> = {};

        const hash = file.filename;
        const result = {
            sizes,
            type,
            path: hash,
            width: -1,
            height: -1,
        };

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
                drawWatermark(image, config.watermark);
            }

            await resized.saveJpeg(imagePath, quality);

            if (max) {
                result.width = resized.width;
                result.height = resized.height;
            }

            sizes[key] = pathInfo;
        }

        image.destroy();

        res.send({ result });
    } catch (e) {
        console.log(e);
        res.send({ error: e.toString() });
    }

    res.send(`ok ${type} ${sig}`);
}
