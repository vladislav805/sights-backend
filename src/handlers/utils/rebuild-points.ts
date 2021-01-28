import { ICompanionPrivate, PrivateMethodAPI } from '../method';
import { IUserAchievements } from '../../types/user';

type Params = {
    userId: number;
};

type Result = unknown;

/**
 * 3 балла за добавление. Не факт, что это просто
 * не добавление всего подряд
 */
const SIGHT_ADD = 3;

/**
 * Если подтвердилось, то к уже трём добавляем ещё
 * пять. Получаем восемь за добавленную верифицированную
 * достопримечательность.
 */
const SIGHT_VERIFIED = 5;

/**
 * Добавление фото оценивается в 10 баллов.
 */
const PHOTO_UPLOAD = 10;

/**
 * Добавление коллекции оценивается в 10 баллов.
 */
const COLLECTION_ADD = 10;

/**
 * Добавление коммента оценивается в 1 балл.
 */
const COMMENT_ADD = 1;

export default class UtilsRebuildPoints extends PrivateMethodAPI<Params, Result> {
    protected async perform(params: Params, companion: ICompanionPrivate): Promise<Result> {
        if (companion.session.user?.status !== 'ADMIN') {
            return null;
        }

        const allUsers = await companion.database.select<{ userId: number }>('select `userId` from `user`');

        for (const { userId } of allUsers) {
            const res = await companion.callMethod<IUserAchievements>('users.getAchievements', { userId });

            const result = [
                res.sights.created * SIGHT_ADD,
                res.sights.verified * SIGHT_VERIFIED,
                res.photos.uploaded * PHOTO_UPLOAD,
                res.collections.created * COLLECTION_ADD,
                res.comments.added * COMMENT_ADD,
            ].reduce((sum, cur) => sum + cur);

            await companion.database.apply(
                'update `user` set `point` = ? where `userId` = ?',
                [result, userId],
            );
        }

        return allUsers.length;
    }
}
