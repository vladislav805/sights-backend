import { joinPhotoPath } from './join-path';

describe('Join path', () => {
    it('should concat to url', () => {
        const domain = 'domain.net';
        const path = 'my/long/path';
        const name = 'file.jpg';

        expect(joinPhotoPath(domain, path, name)).toEqual(`https://${domain}/${path}/${name}`);
    });
});
