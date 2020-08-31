import { packIdentitiesToSql, unpackObject } from './sql-packer-id';

describe('Sql packer id: Pack', () => {
    it('Basic pack', () => {
        const res = packIdentitiesToSql('photo', 'pht', ['photoId', 'path']);

        expect(res).toEqual(['`photo`.`photoId` as `pht_photoId`', '`photo`.`path` as `pht_path`']);
    });
});

describe('Sql packer id: Unpack object', () => {
    it('Basic unpack', () => {
        const obj = {
            id: 123,
            firstName: 'test',
            pht_photoId: 789,
            pht_path: 'ab/cd/ef',
            photoIds: 456,
        };

        const res = unpackObject(obj, 'pht', ['photoId', 'path']);

        const pht = { photoId: 789, path: 'ab/cd/ef' };
        const objRes = { id: 123, firstName: 'test', photoIds: 456 };

        expect(obj).toEqual(objRes);
        expect(res).toEqual(pht);
    });
});
