import { ApiError, ErrorCode } from '../../error';
import { toTheString } from '../../utils/to-string';
import { ApiParam } from '../../types/api';

export type IPointTuple = [number, number];
export type IPointTuple2D = [IPointTuple, IPointTuple];

export type IFieldsGetParamsBase = {
    area: IPointTuple2D; // NE, SW
    count: number;
};

const fixCoordinates = ([[a1, n1], [a2, n2]]: IPointTuple2D): IPointTuple2D => {
    return [
        [Math.min(a1, a2), Math.min(n1, n2)],
        [Math.max(a1, a2), Math.max(n1, n2)],
    ] as IPointTuple2D;
};

export const parseAndCheckArea = (area: ApiParam): IPointTuple2D => {
    const areaRaw = toTheString(area, null, 'area').split(';');

    if (areaRaw.length !== 2) {
        throw new ApiError(ErrorCode.PLACES_ONLY_TWO_POINTS, 'Supported only two points');
    }

    return fixCoordinates(areaRaw.map(point => {
        const coords = point.split(',');

        if (coords.length !== 2) {
            throw new ApiError(ErrorCode.PLACES_INVALID_AREA_FORMAT, 'Unknown point format');
        }

        return coords.map(Number);
    }) as [IPointTuple, IPointTuple]);
};
