# Документация / API / Достопримечательности
## Список методов API секции sights.*
* [sights.get](#sightsget)
* sights.getById
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
* sights.getOwns

#### etc
* Дополнительные поля - [fields](#sight-fields)

## sights.get
### Параметры
* `string? area` - область карты, для которой необходимо получить объекты; строка в формате `NE_lat,NE_lng;SW_lat,SW_lng`;
* `string[]? fields` - [дополнительная информация о достопримечательности](#sight-fields);
* `string[]? filters` - фильтрация объектов, которые нужно получить, допустимые значения:
  * `verified` - подтверждённые;
  * `!verified` - неподтверждённые;
  * `archived` - архивные;
  * `!archived` - не архивные;
  * `photo` - с фотографиями;
  * `!photo` - без фотографий.

### Ответ
```ts
type Response = IApiList<ISight>;
```

## Sight fields
В некоторых методах возможно передать параметр `fields` для получения опциональной дополнительной информации о достопримечательностях. Чтобы получить информацию, нужно перечислить через запятую ключи. Доступны следующие ключи: 
* `author` - вернуть объект пользователя, который добавил достопримечательность;
* `photo` - вернуть объект фотографии достопримечательности;
* `city` - вернуть объект города, в котором достопримечательность находится;
* `tags` - вернуть массив идентификаторов тегов у достопримечательности
* ... при передаче `extended=1`, в методах, которые поддерживают этот параметр для возвращения информации о пользователях, также в `fields` можно передать [ключи для объекта пользователя](methods-users.md#user-fields), такие как `ava`, `isFollowing`, `followers` и `city` (при добавлении последнего город будет возвращаться и в достопримечательностях, и в пользователе).
