import { parseMarkdownForObjects } from './parse-markdown-for-objects';

describe('Utils / parse markdown for objects', () => {
    const empty = { photoIds: [], sightIds: [], collectionIds: [], usernames: [] };

    it('should return all empty keys', () => {
        expect(parseMarkdownForObjects('')).toEqual(empty);
    });

    it('should return sight ids', () => {
        const str = 's [sight:555]1[/sight] v';
        expect(parseMarkdownForObjects(str))
            .toEqual({
                photoIds: [],
                sightIds: [555],
                collectionIds: [],
                usernames: [],
            });
    });

    it('should return collection ids', () => {
        const str = 's [collection:77]2[/collection] v';
        expect(parseMarkdownForObjects(str))
            .toEqual({
                photoIds: [],
                sightIds: [],
                collectionIds: [77],
                usernames: [],
            });
    });

    it('should return usernames', () => {
        const str = 'q @durov z';
        expect(parseMarkdownForObjects(str))
            .toEqual({
                photoIds: [],
                sightIds: [],
                collectionIds: [],
                usernames: ['durov'],
            });
    });

    it('should return photo ids', () => {
        const str = 'qqd [photo:147_258][/photo] q';
        expect(parseMarkdownForObjects(str))
            .toEqual({
                photoIds: [147],
                sightIds: [],
                collectionIds: [],
                usernames: [],
            });

        expect(parseMarkdownForObjects('test [photo:147_258][/photo] lolka\n[photo:789_122][/photo]'))
            .toEqual({ ...empty, photoIds: [147, 789] });
    });

    it('should return photo ids with parameters', () => {
        const str = 's [photo:147_258:width=20%]test[/photo] s';
        expect(parseMarkdownForObjects(str))
            .toEqual({
                photoIds: [147],
                sightIds: [],
                collectionIds: [],
                usernames: [],
            });
    });
});
