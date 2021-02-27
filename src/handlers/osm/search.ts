import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toTheString } from '../../utils/to-string';
import { ISearchItem, searchByQuery } from '../../utils/osm/search';

type IParams = {
    query: string;
    viewBox: string;
};

type IResult = ISearchItem[];

export default class OsmSearch extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        return {
            query: toTheString(params.query),
            viewBox: toTheString(params.viewBox, true),
        };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        return searchByQuery(params.query, 7, params.viewBox);
    }
}
