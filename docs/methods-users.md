# Документация / API / Пользователи
## Список методов секции users.*
* [users.get](#usersget)
* users.search
* users.subscribe
* users.getFollowers

## users.get
### Параметры
* `(string|int)[] userIds` - идентификаторы или логины пользователей, информацию о которых нужно получить;
* `string[]? fields` - дополнительная информация, которую можно получить, допустимые значения:
  * `photo` - получить объект фотографии пользователя;
  * `city` - получить объект города пользователя;
  * `followers` - получить количество подписчиков пользователя.
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
* `int? cityId` - идентификатор города, пользователей из которого нужно искать.

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
