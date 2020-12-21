import { ICompanion, OpenMethodAPI } from '../method';
import { IField } from '../../types/field';
import { ISession } from '../../types/session';

type IParams = never;

export default class FieldsGetAll extends OpenMethodAPI<IParams, IField[]> {
    protected async perform(params: IParams, props: ICompanion<ISession | null>): Promise<IField[]> {
        return props.database.select<IField>(
            'select * from `field` left join `fieldType` on `field`.`type` = `fieldType`.`type`',
            [],
        );
    }
}
