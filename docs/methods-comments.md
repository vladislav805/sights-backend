# Документация / API / Комментарии
## Список методов API секции comments.*
* [comments.get](#commentsget)
* [comments.add](#commentsadd)
* [comments.remove](#commentsremove)
* [comments.report](#commentsreport)

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

## comments.add
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `string text` - текст комментария.

### Формат ответа
```ts
type Response = IComment;
``` 

### Пример ответа
```json5
{
    "result": {
        "commentId": 113,
        "sightId": 470,
        "userId": 1,
        "date": 1598889118,
        "text": "123"
    }
}
```

## comments.remove
### Параметры
* `commentId` - идентификатор комментария.

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

## comments.report
### Параметры
* `int commentId` - идентификатор комментария.

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
