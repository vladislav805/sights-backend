import { transformCode } from './runner';
import { initMethods } from '../index';

describe('API / execute runner', () => {
    beforeEach(() => {
        initMethods();
    });

    it('should insert await before api call', () => {
        const code = 'var a = API.utils.getTime(); return { a };';
        const result = transformCode(code);

        expect(result).toEqual('var a=await API.utils.getTime();return{a};');
    });

    it('should insert await before and brackets under api call', () => {
        const code = 'var a = API.cities.get().items; return { a };';
        const result = transformCode(code);

        expect(result).toEqual('var a=(await API.cities.get()).items;return{a};');
    });
});
