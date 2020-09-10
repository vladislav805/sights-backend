export const base64encode = (data: string): string => Buffer.from(data).toString('base64');

export const base64decode = (base64: string): string => Buffer.from(base64, 'base64').toString();
