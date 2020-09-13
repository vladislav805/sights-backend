type IDiffInsertDelete = {
    toDelete: number[];
    toInsert: number[];
};

export default function differenceInsertDelete(actual: number[], expect: number[]): IDiffInsertDelete {
    return {
        toDelete: actual.filter(id => !expect.includes(id)),
        toInsert: expect.filter(id => !actual.includes(id)),
    };
}
