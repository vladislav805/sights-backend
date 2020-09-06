import { paramToArrayOf } from './param-to-array-of';
import { USERS_GET_FIELDS_ALLOWED } from '../handlers/users/keys';

export type BuildResult = {
    joins: string;
    columns: string;
};

export abstract class FieldsManager<Field extends string, ObjectType> {
    private fields: Field[];

    public constructor(fields: string) {
        this.fields = paramToArrayOf<Field>(fields).filter(key => USERS_GET_FIELDS_ALLOWED.includes(key));
    }

    protected is = (field: Field): boolean => this.fields.includes(field)

    public abstract build(): BuildResult;

    public abstract handleResult(item: ObjectType): ObjectType;
}
