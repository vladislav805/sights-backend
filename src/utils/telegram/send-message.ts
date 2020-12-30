import { Telegram } from '@apidog/multibot-sdk-ts';
import config from '../../config';

const tg = new Telegram.Bot({
    secret: config.ThirdParty.Telegram.TOKEN,
});

export const sendTelegramMessage = (text: string): void => {
    tg.sendMessage({
        text,
        chat_id: config.UID.TELEGRAM_ADMIN_ID,
        parse_mode: Telegram.ParseMode.Markdown,
        disable_notification: true,
    });
};
