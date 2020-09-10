import config from '../config';
import * as gd from 'node-gd';

type ImageSize = {
    width: number;
    height: number;
};

/**
 * Получение размера блока, занимаемого текстом
 * @param image Изображение
 * @param fontSize Размер текста
 * @param text Текст
 * @returns Ширина и высота занимаемая текстом
 */
export const getTextDimens = (image: gd.Image, fontSize: number, text: string): ImageSize => {
    const sizes = image.stringFTBBox(
        0x000000, // color
        config.watermark.font.file,
        fontSize,
        0,
        0,
        0,
        text,
    );

    return {
        width: sizes[4] - sizes[6],
        height: sizes[1] - sizes[7]
    };
};
