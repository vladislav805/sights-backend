import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IPlace } from '../../types/place';
import { toNumber } from '../../utils/to-number';
import { ApiError, ErrorCode } from '../../error';
import { IDatabaseBundle } from '../../database';
import { getAddressByCoordinate } from '../../utils/osm/geocoding';

type IParams = {
    latitude: number;
    longitude: number;
};

type IResult = IPlace;

const checkConstraint = (value: number, min: number, max: number): number => {
    if (value < min || value > max) {
        throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Invalid coordinate');
    }
    return value;
};

export default class MapAddPlace extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        return {
            latitude: checkConstraint(toNumber(params.latitude, 'latitude'), -180, 180),
            longitude: checkConstraint(toNumber(params.longitude, 'longitude'), -90, 90),
        };
    }

    protected async perform({ latitude, longitude }: IParams, { database }: ICompanion): Promise<IResult> {
        return this.create(database, latitude, longitude);
    }

    private async create(database: IDatabaseBundle, latitude: number, longitude: number): Promise<IPlace> {
        try {
            const addressInfo = await getAddressByCoordinate([latitude, longitude]);

            const address = addressInfo?.address ?? '';

            const result = await database.apply(
                'insert into `place` (`latitude`, `longitude`, `address`) values (?, ?, ?)',
                [latitude, longitude, address],
            );

            return {
                placeId: result.insertId,
                latitude,
                longitude,
                address,
            };
        } catch (e) {
            if (e.message.includes('Duplicate entry')) {
                return this.findExists(database, latitude, longitude);
            }
            throw new ApiError(ErrorCode.UNKNOWN, '?');
        }
    }

    // noinspection JSMethodCanBeStatic
    private async findExists(database: IDatabaseBundle, latitude: number, longitude: number): Promise<IPlace> {
        const [item] = await database.select<IPlace>(
            'select * from `place` where `latitude` = ? and `longitude`= ? limit 1',
            [latitude, longitude],
        );

        return item;
    }
}
