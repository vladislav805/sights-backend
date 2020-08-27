import * as mysql from 'promise-mysql';

class ConnectDatabase {
    private connection: mysql.Connection;
    private readonly config: mysql.ConnectionConfig;

    constructor(config: mysql.ConnectionConfig) {
        this.config = config;
    }

    connect = async() => {
        this.connection = await mysql.createConnection(this.config);
        return this.connection;
    }
}

export default ConnectDatabase;
