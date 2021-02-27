import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { getAddressByCoordinate, IAddressResult } from '../../utils/osm/geocoding';
import { toNumber } from '../../utils/to-number';

type IParams = {
    latitude: number;
    longitude: number;
};

type IResult = IAddressResult;

export default class OsmGetAddress extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        return {
            latitude: toNumber(params.latitude),
            longitude: toNumber(params.longitude),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        return getAddressByCoordinate([params.latitude, params.longitude]);
    }
}
