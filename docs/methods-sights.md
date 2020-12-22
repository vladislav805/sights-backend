# Документация / API / Достопримечательности
## Список методов API секции sights.*
* [sights.get](#sightsget)
* [sights.getById](#sightsgetbyid)
* [sights.add](#sightsadd)
* sights.edit
* [sights.remove](#sightsremove)
* [sights.setTags](#sightssettags)
* sights.setPhotos
* [sights.setVisitState](#sightssetvisitstate)
* [sights.setMask](#sightssetmask)
* [sights.getNearby](#sightsgetnearby)
* [sights.getRandomSightId](#sightsgetrandomsightid)
* sights.search
* [sights.getRecent](#sightsgetrecent)
* [sights.getCounts](#sightsgetcounts)

#### etc
* Дополнительные поля - [fields](#sight-fields)

## sights.get
### Параметры
* `int ownerId` - идентификатор владельца достопримечательностей;
* `int? count = 50` - количество требуемых достопримечательностей;
* `int? offset = 0` - сдвиг выборки;
* `string? sort = 'desc'` - сортировка (`asc` по возрастанию; `desc` по убыванию).

### Формат ответа
```ts
type Response = IApiList<ISight>;
``` 

### Пример ответа
```json5
{
    "result": {
        "items": [{
            "sightId": 777,
            "ownerId": 1,
            "title": "Простоквашино",
            "description": "К 290-летию города Колпино (Санкт-Петербург) ...",
            "mask": 2,
            "categoryId": 4,
            "dateCreated": 1523738164,
            "dateUpdated": 1523773274,
            "category": {
                "categoryId": 4,
                "title": "Скульптура"
            }
        }]
    }
}
```

## sights.getById
### Параметры
* `int[] sightIds` - идентификаторы достопримечательностей, которые нужно получить;
* `string[]? fields` - [дополнительная информация о достопримечательности](#sight-fields).

### Формат ответа
```ts
type Response = ISight[];
```

### Пример ответа
```json5
{
    "result": {
        "items": [{
            "sightId": 777,
            "ownerId": 1,
            "title": "Простоквашино",
            "description": "К 290-летию города Колпино (Санкт-Петербург) ...",
            "mask": 2,
            "categoryId": 4,
            "dateCreated": 1523738164,
            "dateUpdated": 1523773274,
            "category": {
                "categoryId": 4,
                "title": "Скульптура"
            }
        }]
    }
}
```

## sights.add
### Параметры
* `int placeId` - идентификатор места;
* `string title` - название;
* `string? description` - описание;
* `int? cityId` - идентификатор города;
* `int? categoryId` - идентификатор категории;
* `int[]? tagIds` - идентификаторы тегов.

### Формат ответа
```ts
type Response = {
    sightId: number;
};
```

### Пример ответа
```json5
{
    "result": {
        "sightId": 123
    }
}
```

## sights.remove
### Параметры
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

## sights.setTags
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int[] tagIds` - идентификаторы тегов.

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

## sights.setVisitState
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int state` - [статус посещения](#sight-visit).

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

## sights.setMask
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int mask` - новое значение [битовой маски](#sight-bitmask).

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

## sights.getNearby
### Параметры
* `double latitude` - широта;
* `double longitude` - долгота;
* `int? distance = 1000` - дистанция от места в метрах;
* `int? count = 20` - количество запрашиваемых достопримечательностей;
* `string[]? fields` - [дополнительная информация о достопримечательности](#sight-fields).

### Формат ответа
```ts
type DistanceItem = {
    sightId: number;
    distance: number;
};

type Response = IApiList<> & {
    distances: DistanceItem[];
}
```

### Пример ответа
```json5

```

## sights.getRandomSightId
### Параметры
_Нет параметров_

### Формат ответа
```ts
type Response = number;
```

### Пример ответа
```json5
{
    "result": 777
}
```

## sights.getRecent
### Параметры
* `int count` - количество достопримечательностей, которых необходимо вернуть;
* `string[] fields` - [дополнительная информация о достопримечательности](#sight-fields).

### Формат ответа

```ts
type Response = {
    count: number;
    items: ISight[];
};
```

### Пример ответа
```json5
{
    "result": {
        "count": 1,
        "items": [{
            "placeId": 470,
            "latitude": 5.55186193,
            "longitude": -0.18161557,
            "sightId": 2524,
            "ownerId": 1,
            "title": "test",
            "description": "",
            "mask": 0,
            "categoryId": null,
            "dateCreated": 1600011358,
            "dateUpdated": 0,
            "category": null
        }]
    }
}
```

## sights.getCounts
### Параметры
_Нет параметров_

### Формат ответа
```ts
type Response = {
    total: number;
    verified: number;
    archive: number;
    active: number;
};
```

### Пример ответа
```json5
{
    "result": {
        "total": 2187,
        "verified": 27,
        "active": 1499,
        "archived": 66
    }
}
```

## Sight fields
В некоторых методах возможно передать параметр `fields` для получения опциональной дополнительной информации о достопримечательностях. Чтобы получить информацию, нужно перечислить через запятую ключи. Доступны следующие ключи: 
* `author` - вернуть объект пользователя, который добавил достопримечательность;
* `photo` - вернуть объект фотографии достопримечательности;
* `city` - вернуть объект города, в котором достопримечательность находится;
* `tags` - вернуть массив идентификаторов тегов у достопримечательности
* `visitState` - вернуть одноименное поле, [описывающее состояние посещение достопримечательности](#sight-visit) текущим пользователем (только при наличии авторизации);
* ... при передаче `extended=1`, в методах, которые поддерживают этот параметр для возвращения информации о пользователях, также в `fields` можно передать [ключи для объекта пользователя](methods-users.md#user-fields), например, `ava`, `isFollowed`, `followers` и `city` (при добавлении последнего город будет возвращаться и в достопримечательностях, и в пользователе).

## Sight bitmask
* `2` = `1 << 1` - верифицирована;
* `4` = `1 << 2` - архивирована. 

## Sight visit
* `0` - не посещено;
* `1` - посещено;
* `2` - желаемое.
