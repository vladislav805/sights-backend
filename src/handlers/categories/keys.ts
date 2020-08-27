import { ICategory } from '../../types/category';

export const CATEGORY_ID = 'categoryId';
export const CATEGORY_TITLE = 'title';
export const CATEGORY_KEYS: (keyof ICategory)[] = [
    CATEGORY_ID,
    CATEGORY_TITLE,
];
