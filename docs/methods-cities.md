# Документация / API / Города
## cities
* [cities.get](#citiesget)
* [cities.getById](#citiesgetbyid)
* [cities.search](#citiessearch)

## cities.get
### Параметры
* `int? count = 50` - количество городов, которые необходимо вернуть;
* `int? offset = 0` - сдвиг выборки;
* `boolean? all = false` - вернуть все города (иначе — только крупные);
* `boolean? extended = false` - возвращать ли дополнительные поля о городе.

### Формат ответа
```ts
type Response = IApiList<ICity>;
```

### Пример ответа
`> count=1&extended=1`
```json5
{
    "count": 8,
    "items": [
        {
            "cityId": 1,
            "name": "Санкт-Петербург",
            "latitude": 59.95,
            "longitude": 30.31667,
            "radius": 17500,
            "description": ""
        }
    ]
}
```

## cities.getById
### Параметры
* `int[] cityIds` - идентификаторы городов, которые необходимо получить;
* `boolean? extended = false` - возвращать ли дополнительные поля о городе.

### Формат ответа
```ts
type Response = ICity[];
```

### Пример ответа
`> cityIds=1,3&extended=1`
```json5
{
    "result": [{
        "cityId": 1,
        "name": "Санкт-Петербург",
        "latitude": 59.95,
        "longitude": 30.31667,
        "radius": 17500,
        "description": ""
    }, {
        "cityId": 3,
        "name": "Сестрорецк",
        "radius": 2150,
        "latitude": 60.092411,
        "longitude": 29.956066,
        "parent": {
            "cityId": 1,
            "name": "Ленинградская область"
        }
    }]
}
```

## cities.search
### Параметры
* `string query` - поисковый запрос;
* `int count` - максимальное необходимое количество, которое необходимо вернуть;
* `boolean? extended = false` - возвращать ли дополнительные поля о городе.

### Формат ответа
```ts
type Response = ICity[];
```

### Пример ответа
`> query=сан&extended=1`
```json5
{
    "result": [
        {
            "cityId": 1,
            "name": "Санкт-Петербург",
            "latitude": 59.95,
            "longitude": 30.31667,
            "radius": 17500,
            "description": ""
        }
    ]
}
```
