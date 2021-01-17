import { ICompanion, OpenMethodAPI } from '../method';
import { IField } from '../../types/field';

type IParams = never;

export default class FieldsGetAll extends OpenMethodAPI<IParams, IField[]> {
    protected async perform(params: IParams, props: ICompanion): Promise<IField[]> {
        return props.database.select<IField>(
            'select * from `field` left join `fieldType` on `field`.`type` = `fieldType`.`type`',
            [],
        );
    }
}
