# Документация / API / OpenStreetMap
## osm.*
* [osm.getAddressByCoordinate](#osmgetaddressbycoordinate)
* [osm.search](#osmsearch)

## osm.getAddressByCoordinate
Производит обратный геокодинг - по координатам возвращает информацию об адресе.

### Параметры
* `double latitude`;
* `double longitude`.

### Формат ответа
```ts
type Result = {
    postcode: string;
    country: string;
    state: string;
    city: string;
    district: string;
    road: string;
    house: string;
    address: string;
};
```

### Пример ответа
```json
{
    "result": {
        "postcode": "190000",
        "country": "Россия",
        "state": "Санкт-Петербург",
        "city": "Санкт-Петербург",
        "district": "округ Гражданка",
        "road": "Гражданский проспект",
        "address": "Россия, Санкт-Петербург, округ Гражданка, Гражданский проспект"
    }
}
```

## osm.search
Осуществляет поиск по фразе.

### Параметры
* `string query` - ключевая фраза;
* `string? viewBox` - границы, в которых нужно производить поиск.

### Формат ответа
```ts
type Result = {
    latitude: number;
    longitude: number;
    address: string;
}[];
```

### Пример ответа
```json
{
    "result": [{
        "latitude": 59.9339756,
        "longitude": 30.3284024,
        "address": "Россия, Санкт-Петербург, округ № 78, Думская улица"
    }, {
        "latitude": 59.93393,
        "longitude": 30.3383611,
        "address": "Россия, Санкт-Петербург, Дворцовый округ, Невский проспект"
    }, {
        "latitude": 59.9331167,
        "longitude": 30.3438973,
        "address": "Россия, Санкт-Петербург, Владимирский округ, Невский проспект"
    }]
}
```
