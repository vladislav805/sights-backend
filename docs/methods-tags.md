# Документация / API / Теги
## Список методов API секции tags.*
* [tags.get](#tagsget)
* [tags.getById](#tagsgetbyid)
* [tags.search](#tagssearch)

## tags.get
### Параметры
* `int? count = 50` - количество тегов, которые нужно вернуть;
* `int? offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiList<ITag>;
```

### Пример ответа
> `count=1`
```json5
{
    "result": {
        "count": 36,
        "items": [{
            "tagId": 5,
            "title": "СкульптурнаяКомпозиция"
        }]
    }
}
```

## tags.getById
### Параметры
* `int[] tagIds` - идентификаторы тегов, которые необходимо получить.

### Формат ответа
```ts
type Response = ITag[];
```

### Пример ответа
> `tagIds=5`
```json5
{
    "result": [{
        "tagId": 5,
        "title": "СкульптурнаяКомпозиция"
    }]
}
```

## tags.search
Возвращает подсказки для ввода тегов.
### Параметры
* `string query` - часть поискового запроса.

### Формат ответа
```ts
type Response = ITag[];
```

### Пример ответа
> `query=ко`
```json5
{
    "result": [{
        "tagId": 13,
        "title": "КованноеЖелезо"
    }, {
        "tagId": 16,
        "title": "Кот"
    }, {
        "tagId": 30,
        "title": "Детское"
    }, {
        // ...
    }]
}
```
