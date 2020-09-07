import { checkTelegramHash } from './check-hash';

describe('Telegram check hash', () => {
    it.todo('should check hash', () => {
        const json = JSON.parse('{"id":63923,"first_name":"vladislav805","username":"vladislav805","auth_date":1599484455,"hash":"86bd25766184b2b46ed170f90333ec801b14ed7fdc4a26d82f81de6d09a03159"}');

        expect(checkTelegramHash(json)).toBeTruthy();
    });
});
