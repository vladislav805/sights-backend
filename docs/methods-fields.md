# Документация / API / Поля
## Список методов API секции sights.*
* [fields.getAll](#fieldsgetall)
* [fields.getOfSight](#fieldsgetofsight)

## fields.getAll
### Параметры
__Нет параметров__.

### Формат ответа

```ts
type Response = IField[];
```

### Пример ответа
```json5
{
    "result": {
        "items": [{
            "name": "free_access",
            "type": "boolean",
            "title_ru": "Общедоступно"
        }]
    }
}
```


## fields.getOfSight
### Параметры
* `int[] sightId` - идентификатор достопримечательности, поля о которой необходимо получить.

### Формат ответа

```ts
type Response = ISightField[];
```

### Пример ответа
```json5
{
    "result": {
        "items": [{
            "fieldId": 1,
            "sightId": 1254,
            "field": "free_access",
            "value": "1",
            "type": "boolean",
            "title_ru": "Общедоступно"
        }]
    }
}
```
