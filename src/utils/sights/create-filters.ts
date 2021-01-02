import { ICompanion } from '../../handlers/method';
import { isBit } from '../is-bit';
import { Filter, SIGHTS_GET_FIELD_VISIT_STATE } from '../../handlers/sights/keys';
import SightFieldsManager from './sight-fields-manager';

export type FilterTuple = [string[], (string | number)[]];

export const getSightsFilterQueryParts = (companion: ICompanion, filters: number, fields: SightFieldsManager): FilterTuple => {
    // Для подстановок
    const values: (string | number)[] = [];

    // Для фильтров
    const where: string[] = [];

    // Фильтры по подтверждению и наоборот
    if (isBit(filters, Filter.VERIFIED)) {
        where.push('(`sight`.`mask` & 2) = 2');
    } else if (isBit(filters, Filter.NOT_VERIFIED)) {
        where.push('(`sight`.`mask` & 2) = 0');
    }

    // Фильтры по архивированию и наоборот
    if (isBit(filters, Filter.ARCHIVED)) {
        where.push('(`sight`.`mask` & 4) = 4');
    } else if (isBit(filters, Filter.NOT_ARCHIVED)) {
        where.push('(`sight`.`mask` & 4) = 0');
    }

    // Фильтр по наличию фотографии
    if (isBit(filters, Filter.WITH_PHOTO)) {
        where.push('`p`.`photoId` is not null');
    } else if (isBit(filters, Filter.WITHOUT_PHOTO)) {
        where.push('`p`.`photoId` is null');
    }

    // Фильтр по посещению
    if (
        companion.session &&
        fields.is(SIGHTS_GET_FIELD_VISIT_STATE) &&
        (
            isBit(filters, Filter.VISITED) ||
            isBit(filters, Filter.NOT_VISITED) ||
            isBit(filters, Filter.DESIRED)
        )
    ) {
        fields.add(SIGHTS_GET_FIELD_VISIT_STATE);
        if (isBit(filters, Filter.NOT_VISITED)) {
            where.push('`sightVisit`.`state` is null');
        } else {
            where.push('`sightVisit`.`state` = ?');
            values.push(isBit(filters, Filter.VISITED) ? 1 : 2);
        }
    }

    return [where, values];
};
