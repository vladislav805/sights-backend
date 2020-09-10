import { IUploadPhotoIdentity } from './utils/create-photo-identity';

export interface IUploadPayload {
    sizes: Record<string, IUploadPhotoIdentity>;
    type: number;
    path: string;
    width: number;
    height: number;
    latitude?: number;
    longitude?: number;
    ownerId?: number;
    date?: number;
}
