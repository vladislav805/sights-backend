import { IUploadPhotoWatermark } from './config';
import { getTextDimens } from './utils/text-dimens';
import * as gd from 'node-gd';

export const drawWatermark = (image: gd.Image, watermark: IUploadPhotoWatermark) => {
    const { width, height } = image;

    const blockHeight = Math.round(height * watermark.block.height); // 3% от высоты изображения
    const fontSize = Math.round(blockHeight * watermark.font.size); // 50% от высоты блока
    const dimen = getTextDimens(image, fontSize, watermark.content);

    // Подложка
    image.filledRectangle(
        // Верхний левый угол
        // Слева без отступов, снизу высота изображения минус высота блока
        0, // x1
        (height - blockHeight) | 0, // y1

        // Нижний правый угол
        // Слева вся ширина текста + два паддинга, снизу без отступов (высота изображения)
        (dimen.width + width * watermark.position.x * 2) | 0, // x2
        height, // y2

        // Полупрозрачная подложка
        image.colorAllocateAlpha(0, 0, 0, 0xcc), // color
    );

    // Текст
    image.stringFT(
        watermark.color, // color
        watermark.font.file, // font
        fontSize, // size
        0, // angle

        // Слева один отступ
        (width * watermark.position.x) | 0, // x
        // Снизу высота изображения минус высота текста, минус отступ, минус половина остатка от разницы высоты блока и высоты текста
        (height * (1 - watermark.position.y + .0002)) | 0, // y

        watermark.content, // string
    );
};
