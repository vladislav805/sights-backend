import { VisitState } from '../../types/sight';

export function isValidVisitState(value: number): value is VisitState {
    return [VisitState.NOT_VISITED, VisitState.VISITED, VisitState.DESIRED].includes(value);
}
