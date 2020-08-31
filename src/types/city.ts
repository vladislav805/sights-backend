export interface ICity {
    cityId: number;
    name: string;
    parentId?: number;
    name4child?: string;
    description?: string;
    radius?: number;
    latitude?: number;
    longitude?: number;
}
