import { PhotoType } from '../../types/photo';

const allowed = [PhotoType.SIGHT, PhotoType.SIGHT_SUGGEST, PhotoType.PROFILE];

export const isValidPhotoType = (type: number) => allowed.includes(+type);
