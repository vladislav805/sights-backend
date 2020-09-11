# Документация / API / Пользователи
## Список методов секции users.*
* [users.get](#usersget)
* [users.search](#userssearch)
* [users.subscribe](#userssearch)
* [users.getFollowers](#usersgetfollowers)

#### etc
* Дополнительные поля - [fields](#user-fields)
* Описание пола - [sex](#sex)

## users.get
### Параметры
* `(string|int)[] userIds` - идентификаторы или логины пользователей, информацию о которых нужно получить;
* `string[]? fields` - [дополнительная информация о пользователе](#user-fields).

### Формат ответа
```ts
type Response = IUser[];
```

### Пример ответа
> `userIds=1`
```json5
{
    "result": [{
        "userId": 1,
        "firstName": "Владислав",
        "lastName": "Велюга",
        "sex": "MALE",
        "login": "vladislav805",
        "status": "ADMIN",
        "bio": "",
        "lastSeen": 1598278247
    }]
}
```

## users.search
### Параметры
* `string? query` - запрос, подстрока имени и фамилии;
* `string[]? fields` - [дополнительная информация о пользователях](#user-fields);
* `int? cityId` - идентификатор города, пользователей из которого нужно искать;
* `int? count = 50` - необходимое количество пользователей;
* `int? offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiList<IUser>;
```

### Пример ответа
> `query=Владислав&cityId=1`
```json5
{
    "result": {
        "count": 1,
        "items": [{
            "userId": 1,
            "firstName": "Владислав",
            "lastName": "Велюга",
            "sex": "MALE",
            "login": "vladislav805",
            "status": "ADMIN",
            "bio": "",
            "lastSeen": 1598278247
        }]
    }
}
```

## users.subscribe
Подписаться или отписаться от пользователя.
### Параметры
* `int userId` - идентификатор пользователя;
* `boolean follow = true` - `true` - подписаться, `false` - отписаться.

### Формат ответа
```ts
type Response = boolean;
```

### Пример ответа
> `userId=1&follow=1`
```json5
{
    "result": true
}
```

## users.getFollowers
Получить список подписчиков пользователя.
### Параметры
* `int userId` - идентификатор пользователя, чьих подписчиков нужно получить;
* `string[]? fields` - [дополнительная информация о пользователях](#user-fields);
* `int? count = 50` - количество пользователей, которых нужно получить;
* `int? offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiList<IUser>;
```

### Пример ответа
```json5
{
    "result": {
        "count": 1,
        "items": [{
            "userId": 1,
            "firstName": "Владислав",
            "lastName": "Велюга",
            "sex": "MALE",
            "login": "vladislav805",
            "status": "ADMIN",
            "bio": "",
            "lastSeen": 1598278247
        }]
    }
}
```

## User fields
В некоторых методах возможно передать параметр `fields` для получения опциональной дополнительной информации о пользователе. Чтобы получить информацию, нужно перечислить через запятую ключи. Доступны следующие ключи: 
* `ava` - вернуть объект фотографии пользователя (в поле `photo`);
* `city` - вернуть объект города пользователя;
* `followers` - вернуть количество подписчиков пользователя;
* `isFollowing` - вернуть состояние подписки на пользователя (**только для авторизованного пользователя**).

## sex
Поле `sex` в объекте пользователя может быть одним из трех значений:
* `NOT_SET` - не указано;
* `FEMALE` - женский;
* `MALE` - мужской.

