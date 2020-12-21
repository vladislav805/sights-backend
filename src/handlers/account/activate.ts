import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    hash: string;
};

export default class AccountActivate extends OpenMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const hash = params.hash;

        if (typeof hash === 'string' && hash.length === 10) {
            return { hash };
        }

        throw new ApiError(ErrorCode.INVALID_ACTIVATION_HASH, 'Incorrect activation hash');
    }

    protected async perform({ hash }: IParams, { database }: ICompanion): Promise<boolean> {
        const activationResult = await database.apply(
            'update `user` left join `activate` on `user`.`userId` = `activate`.`userId` set `user`.`status` = \'USER\' where `activate`.`hash` = ? and `user`.`status` = \'INACTIVE\'',
            [hash],
        );

        if (!activationResult.affectedRows) {
            throw new ApiError(ErrorCode.INVALID_ACTIVATION_HASH, 'Invalid activation hash');
        }

        await database.apply('delete from `activate` where `hash` = ?', [hash]);

        return true;
    }
}
