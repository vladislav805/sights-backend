import { ICompanion, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { paramToArrayOf } from '../../utils/param-to-array-of';
import { ApiError, ErrorCode } from '../../error';
import { getRoute, getRouteTrip, IRouteResult, RouteProfile, supportedRouteProfiles } from '../../utils/osm/route';
import { IPlace } from '../../types/place';

type IParams = {
    sightIds: number[];
    profile: RouteProfile;
};

type IResult = IRouteResult;

const isRouteProfile = (type: string): type is RouteProfile => supportedRouteProfiles.includes(type as RouteProfile);

export default class OsmRoute extends PrivateMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        const sightIds = paramToArrayOf(params.sightIds, Number);

        if (sightIds.length < 2) {
            throw new ApiError(ErrorCode.ROUTE_SO_FEW_PLACES);
        }

        if (sightIds.length > 50) {
            throw new ApiError(ErrorCode.ROUTE_SO_MANY_PLACES);
        }

        const profile = params.profile as string;

        if (!isRouteProfile(profile)) {
            throw new ApiError(ErrorCode.ROUTE_INVALID_PROFILE);
        }

        return { sightIds, profile };
    }

    protected async perform({ sightIds, profile }: IParams, { database }: ICompanion): Promise<IResult> {
        const places = await database.select<IPlace>(
            'select `p`.* from `sight` `s` left join `place` `p` on `s`.`placeId` = `p`.`placeId` where `s`.`sightId` in (?)',
            [sightIds],
        );

        const coordinates = places.map(place => [place.latitude, place.longitude]);

        const trip = await getRouteTrip(coordinates, profile);
        console.log(trip);

        const route = await getRoute(trip, profile);
        console.log(route);

        return route;
    }
}
