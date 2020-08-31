import { isBit } from './is-bit';

/**
 * Проверка битовой маски mask на то, что она валидная и не противоречит правилам rules
 * Если в одном правиле находится два вхождения в маску, то она невалидная и возвращается false
 * Если валидная - true
 * @param mask Битовая маска для проверки
 * @param rules Массив с массивом, в котором находится значение степени двойки
 */
export const checkBitmaskValid = (mask: number, rules: number[][]): boolean => {
    for (const rule of rules) {
        let triggered = false;

        for (const item of rule) {
            if (isBit(mask, item)) {
                if (triggered) {
                    return false;
                }

                triggered = true;
            }
        }
    }

    return true;
};
