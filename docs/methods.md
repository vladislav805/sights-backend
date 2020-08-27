# Список методов
## users
* [users.get](#usersget)
* users.search
* users.subscribe
* users.getFollowers

## account
* account.create
* account.authorize
* account.edit
* account.changePassword
* account.setProfilePhoto

## cities
* [cities.get](#citiesget)
* [cities.getById](#citiesgetbyid)

## sights
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

## categories
* [categories.get](#categoriesget)
* [categories.getById](#categoriesgetbyid)

## tags
* [tags.get](#tagsget)
* [tags.getById](#tagsgetbyid)
* [tags.search](#tagssearch)

## photos
* photos.get
* photos.getById
* photos.getUploadUri
* photos.save
* photos.getUnsorted
* photos.remove
* photos.suggestPhoto
* photos.approvePhoto
* photos.declinePhoto

## comments
* comments.get
* comments.add
* comments.remove
* comments.report

## feed
* feed.get

## notifications
* notifications.get
* notifications.readAll

## collections
* collections.get
* collections.search
* collections.add
* collections.edit
* collections.remove

# Объекты
* IUser
* ICity
* ISight
* ICategory
* ITag
* IPhoto
* IComment
* INotification
* ```ts
  interface IApiList<T> {
    count?: number;
    items: T[];
  }
  ```
* ```ts
  interface IApiListExtended<T> extends IApiList<T> {
    users: IUser[];
  }
  ```

# Методы
## users.get
### Параметры
* `(string|int)[] userIds` - идентификаторы или логины пользователей, информацию о которых нужно получить;
* `string[]? fields` - дополнительная информация, которую можно получить, допустимые значения:
  * `photo` - получить объект фотографии пользователя;
  * `city` - получить объект города пользователя;
  * `followers` - получить количество подписчиков пользователя.
### Ответ
```ts
type Response = IUser[];
```

## sights.get
### Параметры
* `string? area` - область карты, для которой необходимо получить объекты; строка в формате `NE_lat,NE_lng;SW_lat,SW_lng`;
* `int? ownerId` - идентификатор пользователя, объекты которого необходимо вернуть;
* `string[]? fields` - дополнительная информация, которую можно получить, допустимые значения:
  * `author` - (только при получении карты) вернуть автора объекта;
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

## cities.get
### Параметры
* `int? count = 50` - количество городов, которые необходимо вернуть;
* `int? offset = 0` - сдвиг выборки;
* `boolean? extended` - возвращать ли дополнительные поля о городе;

### Ответ
```ts
type Response = IApiList<ICity>;
```

## cities.getById
### Параметры
* `int[] cityIds` - идентификаторы городов, которые необходимо получить.

### Ответ
```ts
type Response = IApiList<ICity>;
```

## categories.get
### Параметры
_Без параметров_

### Ответ
```ts
type Response = IApiList<ICategory>;
```

## categories.getById
### Параметры
* `int[] categoryIds` - идентификаторы категорий, которые необходимо получить.

### Ответ
```ts
type Response = ICategory[];
``` 

## tags.get
### Параметры
_Без параметров_

### Ответ
```ts
type Response = IApiList<ITag>;
```

## tags.getById
### Параметры
* `int[] tagIds` - идентификаторы тегов, которые необходимо получить.

### Ответ
```ts
type Response = ITag[];
``` 

## tags.search
### Параметры
* `string substring` - часть поискового запроса.

### Ответ
```ts
type Response = ITag[];
``` 
