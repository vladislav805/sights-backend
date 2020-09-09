# Документация / API / Аккаунт
## account (непубличное API)
* [account.create](#accountcreate)
* [account.activate](#accountactivate)
* [account.authorize](#accountauthorize)
* account.edit
* account.changePassword
* [account.setProfilePhoto](#accountsetprofilephoto)
* [account.setOnline](#accountsetonline)

## Варианты входа в аккаунт на сайте
### Основная регистрация
* Пользовать регистрируется, как обычно, заполняя поля в форме на `/island/register`;
* Клиент отправляет данные на `account.create`;
* API отправляет линк на страницу `/island/activate` с запросом на активацию через `account.activate`;
* Клиент переходит по линку, отправленному выше;
* Аккаунт активирован, далее вход.

### Авторизация через Telegram [[doc](https://core.telegram.org/widgets/login)]
* Пользователь идёт на `/island/telegram`, там есть кнопка:
  ```
  <script async src="https://telegram.org/js/telegram-widget.js?11" data-telegram-login="SightsMapBot" data-size="large" data-auth-url="https://sights.velu.ga/island/telegram" data-request-access="write"></script>
  ```
* После авторизации, клиента перекидывает на `/island/telegram` с полями `id`, `first_name`, `last_name`, `username`, `photo_url`, `auth_date` and `hash`.
* API ищет пользователя по `telegramId`;
    * если находит - авторизация: генерация токена, выход;
    * если не находит - регистрация: клиент отправляет данные на `account.create`: `id`, `firstName`, `lastName`, `login`, `telegramId`;
    * аккаунт создан и активирован, автоматический вход.

### Авторизация через ВКонтакте
* Пользователь идёт на `/island/vk`, его перенаправляет на страницу авторизации ВКонтакте;
* Он даёт разрешение, если он это не делал ранее;
* ВК перебрасывает клиента на `/island/vk` с параметром `code`;
* API получает токен и информацию о пользователе;
* API ищет пользователя по `vkId`;
    * если находит - авторизация: генерация токена, выход;
    * если не находит - регистрация: редирект на `/island/register?vk` с отсутствием полей `email`, `password`, остальные поля автоматически заполняются из аккаунта + скрытое поле `vkId`;
    * клиент отправляет данные на `account.create`;
    * аккаунт создан и активирован, автоматический вход.

## account.create
### Параметры
* `string? email` - email (при обычной регистрации) 
* `string? login` - логин пользователя (при обычной регистрации);
* `string? password` - пароль пользователя (при обычной регистрации);
* `string firstName` - имя пользователя;
* `string lastName` - фамилия пользователя;
* `string? sex` - пол пользователя (см. [здесь](methods-users.md#sex));
* `int? cityId` - идентификатор города пользователя;
* `string? vkToken` - токен ВКонтакте;
* `string? tgId` - id telegram.

### Формат ответа
```ts
type Response = {
    userId: number;
    sent: boolean;
};
```

## account.activate
### Параметры
* `string hash` - хэш.

### Формат ответа
```ts
type Response = boolean;
```

### Пример ответа
```json5
{
    "result": true
}
```

## account.authorize
### Параметры
* `string login` - логин или email;
* `string password` - пароль.

### Формат ответа
```ts
type Response = ISession;
```

### Пример ответа
```json5
{
    "result": {
        "userId": 1,
        "authKey": "aaaaaaaaaaaaaaaaaaaa...aaaaaaaaaaaaaaaaaaaa",
        "date": 1599601997,
        "authId": 328
    }
}
```

## account.edit
### Параметры
* `string? firstName` - имя;
* `string? lastName` - фамилия;
* `string? login` - логин (можно изменить только если он ещё не установлен);
* `int? cityId` - идентификатор города.

### Формат ответа
```ts
type Response = boolean;
```

### Пример ответа
```json5

```

## account.changePassword
### Параметры
* `string oldPassword` - старый пароль;
* `string newPassword` - новый пароль.

### Формат ответа
```ts
type Response = {
    authKey: string;
};
```

### Пример ответа
```json5

```

## account.setProfilePhoto
### Параметры
* `int photoId` - идентификатор фотографии (если нужно просто удалить фотографию профиля - передать "-1").

### Формат ответа
```ts
type Response = boolean;
```

### Пример ответа
```json5
{
    "result": true
}
```

## account.setOnline
### Параметры
_Нет параметров_

### Формат ответа
```ts
type Response = boolean;
```

### Пример ответа
```json5
{
    "result": true
}
```
