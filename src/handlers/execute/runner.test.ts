import { transformCode } from './runner';
import { initMethods } from '../index';

describe('API / execute runner', () => {
    beforeEach(() => {
        initMethods();
    });

    it('should insert await before api call', () => {
        const code = 'var a = API.utils.getTime(); return { a };';
        const result = transformCode(code);

        console.log(result);

        expect(result).toEqual('var a=await callMethodInternal("utils.getTime",{});return{a};');
    });

    it('should insert await before and brackets under api call', () => {
        const code = 'var a = API.cities.get({offset:1}).items; return { a };';
        const result = transformCode(code);

        expect(result).toEqual('var a=(await callMethodInternal("cities.get",{offset:1})).items;return{a};');
    });

    it('should remove call internal function', () => {
        const code = 'return callMethodInternal();';
        const result = transformCode(code);

        expect(result).toEqual('return;');
    });
});
