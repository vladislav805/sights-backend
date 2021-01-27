import { parseMarkdownForObjects } from './parse-markdown-for-objects';

describe('Utils / parse markdown for objects', () => {
    const empty = { photoIds: [], sightIds: [], collectionIds: [], usernames: [] };

    it('should return all empty keys', () => {
        expect(parseMarkdownForObjects('')).toEqual(empty);
    });

    it('should return ids', () => {
        const str = 's [photo:147_258][/photo] q @durov z [sight:555]1[/sight] s [collection:77]2[/collection] v';
        expect(parseMarkdownForObjects(str))
            .toEqual({
                photoIds: [147],
                sightIds: [555],
                collectionIds: [77],
                usernames: ['durov'],
            });

        expect(parseMarkdownForObjects('test [photo:147_258][/photo] lolka\n[photo:789_122][/photo]'))
            .toEqual({ ...empty, photoIds: [147, 789] });
    });
});
