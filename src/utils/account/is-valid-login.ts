import { isDefaultLogin } from './is-default-login';

export const isValidLogin = (login: string): boolean => /^[A-Za-z_0-9]{4,20}$/i.test(login) && !isDefaultLogin(login);
