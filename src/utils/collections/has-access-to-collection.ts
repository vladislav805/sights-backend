import { ICollection } from '../../types/collection';
import { ISession } from '../../types/session';

export const hasAccessToCollection = (collection: ICollection, session: ISession | null): boolean => {
    switch (collection.type) {
        case 'PUBLIC': {
            return true;
        }

        case 'PRIVATE':
        case 'NEURAL_RESULT': {
            return collection.ownerId === session?.userId;
        }

        case 'DRAFT': {
            return true; // todo add hash check
        }
    }
};
