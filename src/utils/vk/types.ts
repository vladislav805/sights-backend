export interface IVkAuthResult {
    uid: number;
    first_name: string;
    last_name: string;
    photo: string;
    photo_rec: string;
    session: {
        expire: number;
        mid: number;
        secret: string;
        sid: string;
        sig: string;
    };
    hash: string;
}
