import * as md5 from 'md5';
import { PhotoType } from '../../types/photo';
import { getConfigValue } from '../../config';

const secret = getConfigValue<string>('SECRET_UPLOAD');

export const getUploadSignature = (type: PhotoType, k: number, pSig: string): string => md5(`upload_${type}_${k}_${pSig}_${secret}`);
