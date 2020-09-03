import { IMethodCallProps, PrivateMethodAPI } from '../method';
import { IApiParams } from '../../types/api';

type IParams = {
    photoId: number;
};

export default class PhotosRemove extends PrivateMethodAPI<IParams, boolean> {
    protected handleParams(params: IApiParams, props: IMethodCallProps): IParams {
        const photoId = +params.photoId;

        if (!photoId) {
            throw new Error('Not specified photoId');
        }

        return { photoId };
    }

    // TODO доделать удаление самих файлов
    protected async perform({ photoId }: IParams, { database, session }: IMethodCallProps): Promise<boolean> {
        const result = await database.apply(
            'delete from `photo` where `photoId` = ? and `ownerId` = ?',
            [photoId, session?.userId],
        );

        return result.affectedRows === 0;
    }
}
