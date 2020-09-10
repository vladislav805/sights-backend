import * as gd from 'node-gd';

export const getOrientation = (type: string): number => ({
    'Horizontal (normal)': 1,
    'Mirror horizontal': 2,
    'Rotate 180': 3,
    'Mirror vertical': 4,
    'Mirror horizontal and rotate 270 CW': 5,
    'Rotate 90 CW': 6,
    'Mirror horizontal and rotate 90 CW': 7,
    'Rotate 270 CW': 8,
}[type]);

const getAngle = (orientation: number): number => ({
    3: 180,
    6: 270,
    8: 90,
}[orientation]);

export default async function fixOrientation(image: gd.Image, exif: Record<number, string>): Promise<gd.Image> {
    const orientation = getOrientation(exif[0x0112]);

    if (orientation && orientation !== 1) {
        const deg = getAngle(orientation);

        if (deg) {
            const { width, height } = image;

            const changeOrientation = deg === 90 || deg === 270;

            const copyWidth = changeOrientation ? height : width;
            const copyHeight = changeOrientation ? width : height;

            const copy = await gd.createTrueColor(copyWidth, copyHeight);

            image.copyRotated(copy, copyWidth / 2, copyHeight / 2, 0, 0, width, height, deg);

            return copy;
        }
    }

    return image;
}
