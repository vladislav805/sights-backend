import * as jest from 'jest';
import { convert, Type } from './params';

describe('Params utils', () => {
    it('should pass empty object', () => {
        const params = {};
        const rules = [];

        expect(() => convert(params, rules)).not.toThrowError();
    });

    it('should pass valid object', () => {
        const params = { userId: '1' };
        const rules = [
            { name: 'userId', type: Type.Number, required: true },
        ];

        let res;
        expect(() => res = convert(params, rules)).not.toThrowError();
        expect(res).toEqual({ userId: 1 });
    });

    it('should pass unnessary params', () => {
        const params = { userId: '1' };
        const rules = [];

        let res;
        expect(() => res = convert(params, rules)).not.toThrowError();
        expect(res).toEqual({});
    });

    it('should throw exception on lack of required param', () => {
        const params = {};
        const rules = [
            { name: 'userId', type: Type.Number, required: true },
        ];

        expect(() => convert(params, rules)).toThrowError();
    });

    it('should throw exception on invalid type object', () => {
        const params = { userId: 'abc' };
        const rules = [
            { name: 'userId', type: Type.Number, required: true },
        ];

        expect(() => convert(params, rules)).toThrowError();
    });

    it('should pass on valid array type', () => {
        const params = { userIds: '1,2,3' };
        const rules = [
            { name: 'userIds', type: Type.NumberArray },
        ];

        let res;
        expect(() => res = convert(params, rules)).not.toThrowError();
        expect(res).toEqual({ userIds: [1, 2, 3] });
    });

    it('should throw exception on invalid array type', () => {
        const params = { userIds: 'a,b,c' };
        const rules = [
            { name: 'userIds', type: Type.NumberArray },
        ];

        expect(() => convert(params, rules)).toThrowError();
    });

    it('should throw exception on empty required param', () => {
        const params = { title: '' };
        const rules = [
            { name: 'title', type: Type.String, required: true },
        ];

        expect(() => convert(params, rules)).toThrowError();
    });

    it('should throw exception on empty spaced required param', () => {
        const params = { title: ' \t' };
        const rules = [
            { name: 'title', type: Type.String, required: true },
        ];

        expect(() => convert(params, rules)).toThrowError();
    });

    it('should pass on string array', () => {
        const params = { userId: 'a,b,c' };
        const rules = [
            { name: 'userId', type: Type.StringArray, required: true },
        ];

        let res;
        expect(() => res = convert(params, rules)).not.toThrowError();
        expect(res).toEqual({ userId: ['a', 'b', 'c']});
    });

    it('should pass on boolean', () => {
        const rules = [
            { name: 'extended', type: Type.Boolean, required: true },
        ];

        let res;

        expect(() => res = convert({ extended: 'true' }, rules)).not.toThrowError();
        expect(res).toEqual({ extended: true });

        expect(() => res = convert({ extended: '1' }, rules)).not.toThrowError();
        expect(res).toEqual({ extended: true });

        expect(() => res = convert({ extended: 'false' }, rules)).not.toThrowError();
        expect(res).toEqual({ extended: false });

        expect(() => res = convert({ extended: '0' }, rules)).not.toThrowError();
        expect(res).toEqual({ extended: false });
    });

    it('should add default value on skipped boolean', () => {
        const rules = [
            { name: 'extended', type: Type.Boolean, required: true, defaultValue: true },
        ];

        let res;
        expect(() => res = convert({}, rules)).not.toThrowError();
        expect(res).toEqual({ extended: true });
    });

    it('should throw exception on string in number array', () => {
        const params = { userIds: '1,a' };
        const rules = [
            { name: 'userIds', type: Type.NumberArray, required: true },
        ];

        expect(() => convert(params, rules)).toThrowError();
    });

    it('should pass empty number with defaultValue array', () => {
        const params = { userIds: '' };
        const rules = [
            { name: 'userIds', type: Type.NumberArray, required: true, defaultValue: [1, 2] },
        ];

        let res;
        expect(() => res = convert(params, rules)).not.toThrowError();
        expect(res).toEqual({ userIds: rules[0].defaultValue });
    });

    it('should pass multiple arguments', () => {
        const rules = [
            { name: 'login', type: Type.String, required: true },
            { name: 'id', type: Type.Number, required: true },
            { name: 'ids', type: Type.NumberArray, required: true },
            { name: 'marks', type: Type.StringArray, required: true }
        ];

        let enter = { login: 'a', id: '1', ids: '27,69', marks: 'a,b' };
        let res;
        expect(() => res = convert(enter, rules)).not.toThrowError();
        expect(res).toEqual({ login: 'a', id: 1, ids: [27, 69], marks: ['a', 'b'] });
    });
});
