import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { IInternalPage } from '../../types/internal';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    pageId: string;
};

type IResult = IInternalPage;

export default class InternalGetPage extends OpenMethodAPI<IParams, IResult> {
    protected handleParams(params: IApiParams, companion: ICompanion): IParams {
        const pageId = String(params.pageId ?? '').trim();

        if (!pageId) {
            throw new ApiError(ErrorCode.INTERNAL_PAGE_NOT_FOUND, 'pageId is missed');
        }

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
