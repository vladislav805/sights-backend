# Документация / API / Комментарии
## Список методов API секции comments.*
* [comments.get](#commentsget)
* comments.add
* comments.remove
* comments.report

## comments.get
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int? count = 50` - количество запрашиваемых комментариев;
* `int? offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiListExtended<IComment>;
```

### Пример ответа
```json5
{
    "result": {
        "count": 1,
        "items": [
            {
                "commentId": 9,
                "sightId": 471,
                "userId": 1,
                "date": 1511093391,
                "text": "test"
            }
        ],
        "users": [
            {
                "userId": 1,
                "firstName": "Владислав",
                "lastName": "Велюга",
                "sex": "MALE",
                "login": "vladislav805",
                "status": "ADMIN",
                "bio": "",
                "lastSeen": 1598278247
            }
        ]
    }
}
```
