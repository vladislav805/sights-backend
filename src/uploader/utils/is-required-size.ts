import * as gd from 'node-gd';
import { PhotoType } from '../../types/photo';

type ISizeRule = {
    minSide: number;
};

const rules: Record<PhotoType, ISizeRule> = {
    [PhotoType.PROFILE]: {
        minSide: 720,
    },
    [PhotoType.SIGHT]: {
        minSide: 1280,
    },
    [PhotoType.SIGHT_SUGGEST]: {
        minSide: 1280,
    },
};

/**
 * Проверка на то, что фотография подходит под условия
 * @param image Изображение
 * @param type Тип фото
 * @returns true, если всё ок
 */
export const isRequiredSize = (image: gd.Image, type: PhotoType): boolean => {
    const { width, height } = image;
    const imageSmallestSide = Math.min(width, height);

    return imageSmallestSide >= rules[type].minSide;
};
