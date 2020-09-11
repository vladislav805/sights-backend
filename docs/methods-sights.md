# Документация / API / Достопримечательности
## Список методов API секции sights.*
* [sights.get](#sightsget)
* [sights.getById](#sightsgetbyid)
* sights.add
* sights.edit
* sights.remove
* sights.setTags
* sights.setPhotos
* sights.setVisitState
* sights.setMask
* <s>sights.setVerify</s> (заменено методом `sights.setMask`)
* <s>sights.setArchived</s> (заменено методом `sights.setMask`)
* sights.getNearby
* sights.getRandomSightId
* sights.search
* sights.getCounts

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
* `string[]? fields` - [дополнительная информация о достопримечательности](#sight-fields);

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

## Sight fields
В некоторых методах возможно передать параметр `fields` для получения опциональной дополнительной информации о достопримечательностях. Чтобы получить информацию, нужно перечислить через запятую ключи. Доступны следующие ключи: 
* `author` - вернуть объект пользователя, который добавил достопримечательность;
* `photo` - вернуть объект фотографии достопримечательности;
* `city` - вернуть объект города, в котором достопримечательность находится;
* `tags` - вернуть массив идентификаторов тегов у достопримечательности
* ... при передаче `extended=1`, в методах, которые поддерживают этот параметр для возвращения информации о пользователях, также в `fields` можно передать [ключи для объекта пользователя](methods-users.md#user-fields), например, `ava`, `isFollowing`, `followers` и `city` (при добавлении последнего город будет возвращаться и в достопримечательностях, и в пользователе).
