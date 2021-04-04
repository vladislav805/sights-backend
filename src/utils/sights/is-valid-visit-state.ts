import { VisitState } from '../../types/sight';

export function isValidVisitState(value: number): value is VisitState {
    return [VisitState.NOT_VISITED, VisitState.VISITED].includes(value);
}
