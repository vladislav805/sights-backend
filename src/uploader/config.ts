import { getConfigValue } from '../config';

export type IUploadPhotoSizeKey = 's' | 'b'; // small, big
export type IUploadPhotoVariant = {
    size: number;
    name: IUploadPhotoSizeKey;
    quality: number;
    key: string;
    needWatermark?: boolean;
    max?: boolean;
};

export type IUploadPhotoWatermark = {
    font: IUploadPhotoWatermarkFont;
    block: IUploadPhotoWatermarkBlock;
    position: IUploadPhotoWatermarkPosition;
    color: number;
    content: string;
};

type IUploadPhotoWatermarkFont = {
    file: string;
    size: number;
};

type IUploadPhotoWatermarkBlock = {
    height: 0.03
};

type IUploadPhotoWatermarkPosition = {
    x: number;
    y: number;
};



const server = {
    port: 1060,
};

const domain = {
    main: getConfigValue<string>('DOMAIN_MAIN'),
};

const directory = {
    temp: '/home/vlad805/projects/sights-storage/api/_tmp/',
    loaded: '/home/vlad805/projects/sights-storage/api/_loaded/',
    permanent: '/home/vlad805/projects/sights-storage/data/',
};

const variants: IUploadPhotoVariant[] = [
    {
        size: 1400,
        name: 'b',
        quality: 95,
        key: 'photoMax',
        max: true,
        needWatermark: true,
    },
    {
        size: 200,
        name: 's',
        quality: 50,
        key: 'photo200',
    }
];

const watermark: IUploadPhotoWatermark = {
    font: {
        file: '/home/vlad805/www/sights-backend-node/src/assets/DroidSans.ttf',
        size: 0.50
    },
    block: {
        height: 0.03
    },
    position: {
        x: 0.01,
        y: 0.01
    },
    color: 0xffffff,
    content: "sights.velu.ga",
};

export default {
    server,
    domain,
    directory,
    variants,
    watermark,
};
