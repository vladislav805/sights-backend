export type IMarkdownParsedObjects = {
    photoIds: number[];
    sightIds: number[];
    collectionIds: number[];
    usernames: string[];
};

const sightRe = /\[sight:(\d+)]([^[]+)\[\/sight]/img;
const collectionRe = /\[collection:(\d+)]([^[]+)\[\/collection]/img;
const photoRe = /\[photo:(\d+)_(\d+)(:([a-z]+=[^]]+)+)?]([^[]*)\[\/photo]/img;
const userRe = /@([A-Za-z0-9_]+)/img;

const resetRegExp = (re: RegExp) => {
    re.lastIndex = 0;
    return re;
};

const matchAll = (text: string, re: RegExp, index: number): string[] =>
    Array.from(text.matchAll(resetRegExp(re))).map(item => item[index]);

const int = (n: string): number => +n;

export const parseMarkdownForObjects = (text: string): IMarkdownParsedObjects => {
    const photoIds = matchAll(text, photoRe, 1).map(int);
    const sightIds = matchAll(text, sightRe, 1).map(int);
    const collectionIds = matchAll(text, collectionRe, 1).map(int);
    const usernames = matchAll(text, userRe, 1);

    return { photoIds, sightIds, collectionIds, usernames };
};
