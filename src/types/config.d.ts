import { ConnectionConfig } from 'promise-mysql/index';

export interface SiteConfig {
    domains: SiteDomains;
    port: number;
    database: ConnectionConfig;
}

type SiteDomains = {
    main: string;
    media: string;
};
