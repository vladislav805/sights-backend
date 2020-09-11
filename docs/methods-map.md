# Документация / API / Карта
## Список методов API секции map.*
* [map.get](#mapget)

## map.get
### Параметры
* `string? area` - область карты, для которой необходимо получить объекты; строка в формате `NE_lat,NE_lng;SW_lat,SW_lng`;
* `string[]? fields` - [дополнительная информация о достопримечательности](methods-sights.md#sight-fields);
* `string[]? filters` - фильтрация объектов, которые нужно получить, допустимые значения:
  * `verified` - подтверждённые;
  * `!verified` - неподтверждённые;
  * `archived` - архивные;
  * `!archived` - не архивные;
  * `photo` - с фотографиями;
  * `!photo` - без фотографий.

### Формат ответа
```ts
type Response = IApiList<ISight>;
```

### Пример ответа
```json5
{
    "result": {
        "items": [{
            "placeId": 293,
            "latitude": 59.864436,
            "longitude": 29.925346,
            "sightId": 293,
            "ownerId": 1,
            "title": "Памятник Штиглицу",
            "description": "Штиглиц - барон, крупнейший российский финансист ...",
            "mask": 0,
            "categoryId": 4,
            "dateCreated": 1498989065,
            "dateUpdated": 1509829981,
            "category": {
                "categoryId": 4,
                "title": "Скульптура"
            }
        }, /* ... */ ]
    }
}
```