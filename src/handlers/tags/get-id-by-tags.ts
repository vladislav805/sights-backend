import { ICompanion, OpenMethodAPI } from '../method';
import { IApiParams } from '../../types/api';
import { ITag } from '../../types/tag';
import { difference } from 'lodash';

type IParams = {
    tags: string[];
};

type IResult = number[];

export default class TagsGetIdByTags extends OpenMethodAPI<IParams, IResult> {
    private cache: Map<string, number> = new Map<string, number>();

    protected handleParams(params: IApiParams, props: ICompanion): IParams {
        const tags = typeof params.tags === 'string'
            ? params.tags.toLowerCase().split(',')
            : (params.tags as Array<any>).map(val => String(val).toLowerCase());

        return { tags };
    }

    protected async perform({ tags }: IParams, companion: ICompanion): Promise<IResult> {
        // теги, которые есть в кэше
        const cachedTags = tags.filter(title => this.cache.has(title));

        // в результат кидаем то, что есть в кэше
        const result = cachedTags.map(title => this.cache.get(title)!);

        // убираем из требуемых тегов те, которые в кэше уже есть
        const notCached = difference(tags, cachedTags);

        // если есть что дёргать - дёргаем
        const items = (notCached.length
            ? await companion.database.select<ITag>(
                'select * from `tag` where lower(`title`) in (?)',
                [notCached],
            )
            : []);

        // кэшируем то, что из бд
        for (const tag of items) {
            this.cache.set(tag.title, tag.tagId);
        }

        // получаем то, чего нет ни в кэше, ни в бд - это новые
        const newTags = difference(tags, cachedTags, items.map(tag => tag.title));
        const newTagIds: number[] = [];

        for (const tag of newTags) {
            const query = await companion.database.apply(
                'insert into `tag` (`title`) values (?)',
                [tag],
            );

            newTagIds.push(query.insertId);
            this.cache.set(tag, query.insertId);
        }

        return [...result, ...items.map(tag => tag.tagId), ...newTagIds];
    }
}

