import { paramToArrayOf } from './param-to-array-of';
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
    private readonly fields: Field[];

    protected constructor(fields: string, allowed: string[]) {
        this.fields = paramToArrayOf<Field>(String(fields)).filter(key => allowed.includes(key));
    }

    public readonly add = (field: Field): this => {
        this.fields.push(field);
        return this;
    }

    public readonly is = (field: Field): boolean => this.fields.includes(field)

    public abstract build(session: ISession | null): BuildResult;

    public abstract handleResult(item: ObjectType): ObjectType;
}
