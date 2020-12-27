# Документация / API / Аккаунт
## account (непубличное API)
* [account.create](#accountcreate)
* [account.activate](#accountactivate)
* [account.authorize](#accountauthorize)
* [account.edit](#accountedit)
* [account.changePassword](#accountchangepassword)
* [account.setProfilePhoto](#accountsetprofilephoto)
* [account.setOnline](#accountsetonline)
* [account.logout](#accountlogout)
* [account.getSocialConnections](#accountgetsocialconnections)
* [account.setSocialConnection](#accountsetsocialconnection)

## account.create
### Параметры
* `string? email` - email (при обычной регистрации) 
* `string? login` - логин пользователя (при обычной регистрации);
* `string? password` - пароль пользователя (при обычной регистрации);
* `string firstName` - имя пользователя;
* `string lastName` - фамилия пользователя;
* `string? sex` - пол пользователя (см. [здесь](methods-users.md#sex));
* `int? cityId` - идентификатор города пользователя;
* `string? vkData` - JSON-строка, данные от Open API ВКонтакте;
* `string? telegramData` - JSON-строка, данные от Telegram.

### Формат ответа
```ts
type Response = {
    userId: number;
    sent: boolean;
} | ISession;
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
type Response = ISession & {
    user: IUser;
};
```

### Пример ответа
```json5
{
    "result": {
        "userId": 1,
        "authKey": "aaaaaaaaaaaaaaaaaaaa...aaaaaaaaaaaaaaaaaaaa",
        "date": 1599601997,
        "authId": 328,
        "user": {
            "userId": 1,
            "firstName": "Владислав",
            "lastName": "Велюга",
            "sex": "MALE",
            "login": "vladislav805",
            "status": "ADMIN",
            "bio": "",
            "lastSeen": 1598278247
        } 
    }
}
```

## account.edit
### Параметры
* `string? firstName` - имя;
* `string? lastName` - фамилия;
* `string? login` - логин (можно изменить только если он ещё не установлен);
* `string? bio` - о себе;
* `int? sex` - пол (см. [здесь](methods-users.md#sex));
* `int? cityId` - идентификатор города.

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

## account.changePassword
### Параметры
* `string? oldPassword` - старый пароль (не указывается, если его ещё не было, например, вход через соцсети);
* `string newPassword` - новый пароль.

### Формат ответа
```ts
type Response = {
    authKey: string;
};
```

### Пример ответа
```json5
{
    "result": {
        "authKey": "aaaaaaaa...aaaaaaaa"
    }
}
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

## account.logout
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

## account.getSocialConnections
### Параметры
_Нет параметров_

### Формат ответа
```ts
type Response = {
    direct: boolean;
    telegramId: number | null;
    vkId: number | null;
};
```

### Пример ответа
```json5
{
    "result": true
}
```

## account.setSocialConnection
### Параметры
* `string social` - одно из двух: `telegram` или `vk`;
* `string data` - строка, полученная от авторизации.

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
