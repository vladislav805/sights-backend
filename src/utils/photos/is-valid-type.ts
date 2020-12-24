import { PhotoType } from '../../types/photo';

const allowed = [PhotoType.SIGHT, PhotoType.SUGGEST, PhotoType.PROFILE];

export const isValidPhotoType = (type: number) => allowed.includes(+type);
