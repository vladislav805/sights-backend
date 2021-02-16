export const unsafeRandomInt = (a: number, b: number): number => ((b - a) * Math.random() + a) | 0;
