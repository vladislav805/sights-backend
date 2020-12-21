import { ICompanion, OpenMethodAPI } from '../method';

type IRow = {
    id: number;
};

export default class SightsGetRandomSightId extends OpenMethodAPI<never, number> {
    protected async perform(params: never, props: ICompanion): Promise<number> {
        const [{ id }] = await props.database.select<IRow>('select `getRandomSightId`() as `id`');

        return id;
    }
}
