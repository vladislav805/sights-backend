import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IInternalPage } from '../../types/internal';
import { ApiError, ErrorCode } from '../../error';
import { toTheString } from '../../utils/to-string';

type IParams = {
    pageId: string;
};

type IResult = IInternalPage;

export default class InternalGetPage extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        const pageId = toTheString(params.pageId, null, 'pageId');

        return { pageId };
    }

    protected async perform(params: IParams, companion: ICompanion): Promise<IResult> {
        const pages = await companion.database.select<IInternalPage>(
            'select * from `internalPage` where `pageId` = ?',
            [params.pageId],
        );

        if (!pages.length) {
            throw new ApiError(ErrorCode.INTERNAL_PAGE_NOT_FOUND, 'Page not found');
        }

        return pages[0];
    }
}
