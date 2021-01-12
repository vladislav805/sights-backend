# Документация / API / Коллекции
## Список методов API секции collections.*
* [collections.get](#collectionsget)
* [collections.search](#collectionssearch)
* [collections.getById](#collectionsgetbyid)
* [collections.add](#collectionsadd)
* [collections.edit](#collectionsedit)
* [collections.isAffiliate](#collectionsisaffiliate)
* [collections.setAffiliation](#collectionssetaffiliation)
* [collections.remove](#collectionremove)

## collections.get
Возвращает коллекции пользователя.

### Параметры
* `int ownerId` - идентификатор автора коллекций;
* `int count = 50` - количество элементов, которое необходимое вернуть;
* `int offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiList<ICollection>;
```

### Пример ответа
```json5
{
    "result": {
        "count": 1,
        "items": [{
            "collectionId": 1,
            "ownerId": 1,
            "title": "test",
            "content": "",
            "type": "PUBLIC",
            "dateCreated": 1560845050,
            "dateUpdated": 0,
            "cityId": null,
            "size": 0
        }]
    }
}
```


## collections.search
Поиск по коллекциям.

### Параметры
* `string query` - поисковый запрос;
* `int? cityId` - идентификатор города;
* `int count = 50` - количество, необходимое получить;
* `int offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiList<ICollection>;
```

### Пример ответа
```json5
{
    "result": {
        "count": 1,
        "items": [{
            "collectionId": 1,
            "ownerId": 1,
            "title": "test",
            "content": "",
            "type": "PUBLIC",
            "dateCreated": 1560845050,
            "dateUpdated": 0,
            "cityId": null,
            "size": 0
        }]
    }
}
```


## collections.getById
Возвращает коллекцию и полное её содержание по её идентификатору. 

### Параметры
* `string collectionId` - поисковый запрос;
* `boolean onlyInformation = false` - `true`, если нужно получить только базовую информацию (иначе будет возвращён список с достопримечательностями в поле items).

### Формат ответа
```ts
type Response = ICollectionExtended;
```

### Пример ответа
```json5
{
    "result": {
        "collectionId": 1,
        "ownerId": 1,
        "title": "test",
        "content": "",
        "type": "PUBLIC",
        "dateCreated": 1560845050,
        "dateUpdated": 0,
        "cityId": null,
        "size": 0,
        "items": [{
            "placeId": 534,
            "latitude": 59.962834073099586,
            "longitude": 30.303797744704056,
            "sightId": 534,
            "ownerId": 1,
            "title": "«Двор Нельсона»",
            "description": "...",
            "mask": 2,
            "categoryId": 40,
            "dateCreated": 1519416073,
            "dateUpdated": 1609967599,
            "category": {
                "categoryId": 40,
                "title": "Декоративное украшение"
            },
            "canModify": false
        }]
    }
}
```


## collections.add
Создаёт коллекцию.

### Параметры
* `string title` - название коллекции;
* `string type` - тип коллекции:
    * `PUBLIC` - публичная;
    * `PRIVATE` - личная;
    * `DRAFT` - черновик (не выводится в публичном списке, но доступен по специальной ссылке).
* `string content` - описание/текст коллекции в формате Markdown;
* `int? cityId` - идентификатор города, если коллекция привязана к городу.

### Формат ответа
```ts
type Response = ICollection;
```

### Пример ответа
```json5
{
    "result": {
        "collectionId": 5,
        "ownerId": 1,
        "title": "test",
        "content": "ttttt",
        "type": "PRIVATE",
        "dateCreated": 1610391652,
        "dateUpdated": 0,
        "cityId": 1,
        "size": 0
    }
}
```


## collections.edit
Редактирует коллекцию.

### Параметры
* `int collectionId` - идентификатор коллекции;
* `string title` - название коллекции;
* `string type` - тип коллекции:
    * `PUBLIC` - публичная;
    * `PRIVATE` - личная;
    * `DRAFT` - черновик (не выводится в публичном списке, но доступен по специальной ссылке).
* `string content` - описание/текст коллекции в формате Markdown;
* `int? cityId` - идентификатор города, если коллекция привязана к городу.

### Формат ответа
```ts
type Response = ICollection;
```

### Пример ответа
```json5
{
    "result": {
        "collectionId": 5,
        "ownerId": 1,
        "title": "test",
        "content": "ffff",
        "type": "PRIVATE",
        "dateCreated": 1610391652,
        "dateUpdated": 1610391736,
        "cityId": null,
        "size": 0
    }
}
```

## collections.isAffiliate
Проверяет, находится ли достопримечательность в коллекции.

### Параметры
* `int collectionId` - идентификатор коллекции;
* `int sightId` - идентификатор достопримечательности.

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

## collections.setAffiliation
Изменяет принадлежность достопримечательности в коллекции.

### Параметры
* `int collectionId` - идентификатор коллекции;
* `int sightId` - идентификатор достопримечательности; 
* `boolean affiliate` - `true` - добавить, `false` - удалить.

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

## collection.remove
Удаляет коллекцию.

### Параметры
* `int collectionId` - идентификатор коллекции.

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
