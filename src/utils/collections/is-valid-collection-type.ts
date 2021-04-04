import { CollectionType } from '../../types/collection';

const allowedTypes: CollectionType[] = ['PUBLIC', 'PRIVATE', 'DRAFT', 'NEURAL_RESULT'];

export const isValidCollectionType = (type: string): type is CollectionType =>
    allowedTypes.includes(type as CollectionType);
