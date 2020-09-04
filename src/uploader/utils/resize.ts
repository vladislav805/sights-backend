import * as gd from 'node-gd';
import { GDImage } from 'node-gd';

export const resizeToMaxSideSize = (image: GDImage, size: number): Promise<GDImage> => image.width > image.height
    ? resizeToWidth(image, size)
    : resizeToHeight(image, size);

export const resizeToWidth = (image: GDImage, width: number): Promise<GDImage> => {
    const ratio = width / image.width;
    const height = Math.round(image.height * ratio);
    return resize(image, width, height);
};

export const resizeToHeight = (image: GDImage, height: number): Promise<GDImage> => {
    const ratio = height / image.height;
    const width = Math.round(image.width * ratio);
    return resize(image, width, height);
};

/**
 * Создание нового изображения из исходного путём изменения размера последнего
 * @param image Исходное изображение
 * @param width Новая ширина
 * @param height Новая высота
 */
export const resize = async(image: GDImage, width: number, height: number): Promise<GDImage> => {
    const dest = await gd.createTrueColorSync(width, height);

    image.copyResampled(dest, 0, 0, 0, 0, width, height, image.width, image.height);

    return dest;
};
