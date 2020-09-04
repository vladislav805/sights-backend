
declare module 'node-gd' {
    export const openJpeg: (path: string) => Promise<GDImage>;
    export const openPng: (path: string) => Promise<GDImage>;
    export const createFromJpeg: (path: string) => Promise<GDImage>;
    export const createFromPng: (path: string) => Promise<GDImage>;
    export const createTrueColorSync: (width: number, height: number) => Promise<GDImage>;

    type Color = number;

    export interface GDImage {
        width: number;
        height: number;
        stringFTBBox: (color: Color, font: string, size: number, angle: number, x: number, y: number, text: string) => number[];
        stringFT: (color: Color, font: string, size: number, angle: number, x: number, y: number, text: string) => never;
        filledRectangle: (x1: number, y1: number, x2: number, y2: number, color: Color) => never;
        colorAllocateAlpha: (r: number, g: number, b: number, a: number) => number;
        saveJpeg: (path: string, quality: number) => Promise<unknown>;
        savePng: (path: string) => Promise<unknown>;
        destroy: () => void;
        copyResampled: (dest: GDImage, dx: number, dy: number, sx: number, sy: number, dw: number, dh: number, sw: number, sh: number) => void;
    }
}


