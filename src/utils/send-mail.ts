import config from '../config';
import { createTransport, TransportOptions } from 'nodemailer';

export type SendMessageResult = {
    accepted: string[];
    rejected: string[];
    envelopeTime: number;
    messageTime: number;
    messageSize: number;
    response: string;
    envelope: {
        from: string;
        to: string[]
    };
    messageId: string;
};

export const sendMail = (to: string, subject: string, text: string): Promise<SendMessageResult> => {
    const transporter = createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: {
            user: config.secret.EMAIL_LOGIN,
            pass: config.secret.EMAIL_PASSWORD,
        },
    } as TransportOptions);

    return transporter.sendMail({
        from: `Sights NoReply <${config.secret.EMAIL_LOGIN}>`,
        to,
        subject,
        text,
    });
};