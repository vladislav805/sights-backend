import * as gd from 'node-gd';

/**
 * Создание ресурса изображения по загруженному файлу
 * @param {string} path Путь к файлу
 * @param {string} name Название файла
 * @returns {Promise<gd.Image>}
 */
export const createImageFromFile = (path: string, name: string): Promise<gd.Image> => {
    const dot = name.lastIndexOf('.');

    if (dot < 0) {
        throw new Error('unknown extension');
    }

    const extension = name.substring(dot + 1).toLowerCase();

    switch (extension) {
        case 'jpg':
        case 'jpeg': {
            return gd.openJpeg(path);
        }

        case 'png': {
            return gd.openPng(path);
        }

        default: {
            throw new Error('unknown type');
        }
    }
};
