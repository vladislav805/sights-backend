import { difference, intersection } from 'lodash';

type FieldMap = Record<string, string>;

type DifferenceResult = {
    added: string[];
    modified: string[];
    removed: string[];
};

const emptyMap = (map: FieldMap): FieldMap => {
    const copy = { ...map };
    for (const key of Object.keys(copy)) {
        if (!copy[key].trim()) {
            delete copy[key];
        }
    }

    return copy;
};

export default function findDifferenceFields(old: FieldMap, fresh: FieldMap): DifferenceResult {
    const keysOld = Object.keys(emptyMap(old));
    const keysFresh = Object.keys(emptyMap(fresh));

    const added = difference(keysFresh, keysOld);
    const modified = intersection(keysOld, keysFresh).filter(key => old[key] !== fresh[key]);
    const removed = difference(keysOld, keysFresh);

    return { added, modified, removed };
}
