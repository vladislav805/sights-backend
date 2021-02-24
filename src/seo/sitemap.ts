import { createConnectionFromPool } from '../database';
import { ISight } from '../types/sight';
import { IUser } from '../types/user';
import { IInternalPage } from '../types/internal';
import { create } from 'xmlbuilder2';
import config from '../config';

type ISitemapItem = {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
};

const leadZero = (n: number, length = 2): string => ('0'.repeat(length) + n).slice(-length);

const toDate = (unixtime: number): string => {
    const date = new Date(unixtime * 1000);
    return `${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}`;
};

const renderSitemap = async() => {
    const database = await createConnectionFromPool();

    const sights = await database.select<ISight>('select `sightId`, `dateUpdated` from `sight`');
    const users = await database.select<IUser>('select `login` from `user`');
    const pages = await database.select<IInternalPage>('select `pageId` from `internalPage`');

    const urls: ISitemapItem[] = [
        { loc: '', changefreq: 'always' },
        { loc: 'sight/map' },
        { loc: 'search/sights' },
        { loc: 'search/collections' },
        { loc: 'search/users' },
        { loc: 'island/login' },
        { loc: 'island/register' },
        ...sights.map(sight => ({ loc: `sight/${sight.sightId}`, lastmod: toDate(sight.dateUpdated) })),
        ...users.map(user => ({ loc: `user/${user.login}` })),
        ...pages.map(page => ({ loc: `page/${page.pageId}` })),
    ];

    const xml = create({ version: '1.0' })
        .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

    for (const page of urls) {
        const item = xml.ele('url');
        item.ele('loc').txt(`https://${config.domain.MAIN}/${page.loc}`);

        if (page.lastmod) {
            item.ele('lastmod').txt(page.lastmod);
        }

        if (page.changefreq) {
            item.ele('changefreq').txt(page.changefreq);
        }
    }

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml.toString({
        format: 'xml',
        prettyPrint: true,
        headless: false, // не работало с true, но если заработает, чтоб не дублировалось
    });
};

export default renderSitemap;
