import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { toNumber } from '../../utils/to-number';
import { ApiError, ErrorCode } from '../../error';

type IParams = {
    photoId: number;
};

export default class AccountSetProfilePhoto extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: ICompanionPrivate): IParams {
        const photoId = toNumber(params.photoId);

        if (photoId < 0 && photoId !== -1) {
            throw new ApiError(ErrorCode.UNSPECIFIED_PARAM, 'Negative values not allowed (exclude -1)');
        }

        return { photoId };
    }

    protected async perform({ photoId }: IParams, { session, database, callMethod }: ICompanionPrivate): Promise<boolean> {
        const oldData = await database.select<{ photoId: number }>(
            'select `photoId` from `user` where `userId` = ?',
            [session!.userId],
        );

        const oldPhotoId = +oldData[0]?.photoId;

        if (photoId === -1) {
            await database.apply(
                'update `user` set `photoId` = null where `userId` = ?',
                [session!.userId],
            );
        } else {
            await database.apply(
                'update `user` left join `photo` on `photo`.`ownerId` = `user`.`userId` set `user`.`photoId` = `photo`.`photoId` where `photo`.`photoId` = ? and `user`.`userId` = ?',
                [photoId, session!.userId],
            );
        }

        if (oldPhotoId) {
            await callMethod('photos.remove', { photoId: oldPhotoId });
        }

        return true;
    }
}
