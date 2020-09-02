# Документация / API / Новости
## Список методов API секции feed.*
* feed.get

## <font color="red">[PLAN]</font> feed.get
### Параметры
* `int? count = 50` - количество записей для получения.

### Формат ответа
```ts
type Response = IApiListExtended<IFeedItem>;
```

### Пример ответа
```json5
{
    "result": {
        "items": [{
            "type": "sight",
            "date": 1547772444,
            "sight": {
            } 
        }],
        "users": []
    }
}
```
