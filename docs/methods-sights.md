# Документация / API / Достопримечательности
## Список методов API секции sights.*
* [sights.get](#sightsget)
* sights.getById
* sights.add
* sights.edit
* sights.remove
* <s>sights.setTags</s> (заменено параметром `tags` в `sights.edit`)
* sights.setPhotos
* sights.setVisitState
* <s>sights.setVerify</s> (заменено параметром `mask` в `sights.edit`/`sights.add`)
* <s>sights.setArchived</s> (заменено параметром `mask` в `sights.edit`/`sights.add`)
* sights.getNearby
* sights.getRandomSightId
* sights.search
* sights.getCounts
* <s>sights.getOwns</s> (заменено параметром `ownerId` в `sights.get`) 

## sights.get
### Параметры
* `string? area` - область карты, для которой необходимо получить объекты; строка в формате `NE_lat,NE_lng;SW_lat,SW_lng`;
* <s>`int? ownerId` - идентификатор пользователя, объекты которого необходимо вернуть;</s>
* `string[]? fields` - дополнительная информация, которую можно получить, допустимые значения:
  * `city` - город;
  * `photo` - фотография;
* `string[]? filters` - фильтрация объектов, которые нужно получить, допустимые значения:
  * `verified` - подтверждённые;
  * `!verified` - неподтверждённые;
  * `archived` - архивные;
  * `!archived` - не архивные;
  * `photo` - с фотографиями;
  * `!photo` - без фотографий.

### Ответ
```ts
// Если fields не содержит ключ author
type Response = IApiList<ISight>;

// Если fields содержит ключ author
type Response = IApiListExtended<ISight>;
```

