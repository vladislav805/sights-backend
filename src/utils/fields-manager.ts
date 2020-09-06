import { paramToArrayOf } from './param-to-array-of';
import { USERS_GET_FIELDS_ALLOWED } from '../handlers/users/keys';
import { ISession } from '../types/session';

export type BuildResult = {
    joins: string;
    columns: string;
};

export interface IFieldsManager<Field extends string, ObjectType> {
    build(session: ISession | null): BuildResult;
    handleResult(item: ObjectType): ObjectType;
}

export abstract class FieldsManager<Field extends string, ObjectType> implements IFieldsManager<Field, ObjectType> {
    private fields: Field[];

    public constructor(fields: string) {
        this.fields = paramToArrayOf<Field>(fields).filter(key => USERS_GET_FIELDS_ALLOWED.includes(key));
    }

    protected is = (field: Field): boolean => this.fields.includes(field)

    public abstract build(session: ISession | null): BuildResult;

    public abstract handleResult(item: ObjectType): ObjectType;
}
