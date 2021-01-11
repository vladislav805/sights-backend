# Документация / API / Новости
## Список методов API секции feed.*
* [feed.get](#feedget)
* [feed.getSourceList](#feedgetsourcelist)

## feed.get
### Параметры
* `int? count = 50` - количество записей для получения (от 1 до 75).

### Формат ответа
```ts
type Response = IApiListExtended<IFeedItem>;
```

### Пример ответа
```json5
{
    "result": {
        "items": [{
            "type": "photo",
            "ownerId": 2,
            "date": 1584276551,
            "photo": {
                "photoId": 1279,
                "ownerId": 2,
                "type": 2,
                "date": 1584276551,
                "latitude": null,
                "longitude": null,
                "path": "c6/05",
                "photo200": "53820b.s.jpg",
                "photoMax": "53820b.b.jpg",
                "width": 1400,
                "height": 1050
            }
        }],
        "users": [{
            "userId": 2,
            "firstName": "Nadia",
            "lastName": "Ivanova",
            "sex": "FEMALE",
            "login": "nadia_107",
            "status": "ADMIN",
            "bio": "",
            "lastSeen": 1585327227
        }]
    }
}
```

## feed.getSourceList
Возвращает список пользователей, на которых подписан текущий пользователь.

### Параметры
* `int count = 50` - количество пользователей, которое необходимо вернуть;
* `int offset = 0` - сдвиг выборки;
* `string[]? fields` - [дополнительная информация о пользователях](methods-users.md#user-fields).

### Формат ответа
```ts
type Response = IApiList<IUser>;
```

### Пример ответа
```json5

```
