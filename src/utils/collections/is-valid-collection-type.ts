import { CollectionType } from '../../types/collection';

const types: CollectionType[] = ['PUBLIC', 'PRIVATE', 'DRAFT', 'NEURAL_RESULT'];

export const isValidCollectionType = (type: string): type is CollectionType => types.includes(type as CollectionType);
