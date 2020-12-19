# Документация / API / Поля
## Список методов API секции fields.*
* [fields.getAll](#fieldsgetall)
* [fields.get](#fieldsget)
* [fields.set](#fieldsset)

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


## fields.get
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

## fields.set
### Параметры
* `int[] sightId` - идентификатор достопримечательности, поля о которой необходимо изменить;
* `string details` - JSON-строка, в которой описан объект со всеми полями, например:
  ```json
  {
      "verified": "1",
      "...": "..."  
  }
  ```
  Поддерживаются только строковые данные.

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
