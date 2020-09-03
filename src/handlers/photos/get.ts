import { OpenMethodAPI } from '../method';
import { IApiList } from '../../types/api';
import { IPhoto } from '../../types/photo';

type IParam = {
    sightId: number;
};

export default class PhotosGet extends OpenMethodAPI<IParam, IApiList<IPhoto>> {

}
