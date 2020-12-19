import * as md5 from 'md5';
import { PhotoType } from '../../types/photo';
import config from '../../config';

export const getUploadSignature = (type: PhotoType, k: number, pSig: string): string => md5(`upload_${type}_${k}_${pSig}_${config.secret.UPLOAD_UPLOAD}`);
