# Документация / API / Новости
## Список методов API секции feed.*
* [feed.get](#feedget)
* [feed.getSourceList](#feedgetsourcelist)

## feed.get
### Параметры
* `int? count = 50` - количество записей для получения (от 1 до 75).

### Формат ответа
```ts
type Response = IApiListExtended<IFeedItem> & {
    sights: ISight[];
    collections: ICollection[];
    photos: IPhoto[];
    comments: IComment[];
};
```

### Пример ответа
```json5
{
  "result": {
    "items": [
      {
        "type": "comment",
        "date": 126,
        "actorId": 1,
        "commentId": 107,
        "sightId": 2517
      },
      {
        "type": "photo",
        "date": 125,
        "actorId": 1,
        "photoId": 777,
        "sightId": 1810
      },
      {
        "type": "collection",
        "date": 124,
        "actorId": 1,
        "photoId": 777,
        "sightId": 1810,
        "collectionId": 10
      },
      {
        "type": "sight",
        "date": 123,
        "actorId": 12,
        "photoId": 777,
        "sightId": 777,
        "collectionId": 10
      }
    ],
    "users": [
      {
        "userId": 1,
        "firstName": "first",
        "lastName": "name",
        "sex": "MALE",
        "login": "username",
        "status": "USER",
        "bio": "",
        "lastSeen": 1581532722
      }
    ],
    "sights": [
      {
        "sightId": 1810,
        "ownerId": 1,
        "title": "\"Рождение первооткрывателя\"",
        "description": "Установлено: 1 августа 2007 г.\nСкульптор: В.А. Гаврилов",
        "mask": 2,
        "categoryId": 40,
        "dateCreated": 1556294007,
        "dateUpdated": 0
      },
      {
        "sightId": 777,
        "ownerId": 1,
        "title": "Простоквашино",
        "description": "...",
        "mask": 2,
        "categoryId": 4,
        "dateCreated": 1523738164,
        "dateUpdated": 1609111014
      }
    ],
    "collections": [
      {
        "collectionId": 10,
        "ownerId": 1,
        "type": "DRAFT",
        "title": "Test collection",
        "content": "...",
        "dateCreated": 1611712232,
        "dateUpdated": 1611766755,
        "cityId": null,
        "size": 0
      }
    ],
    "photos": [
      {
        "photoId": 777,
        "photo200": "https://ps-sights.velu.ga/77/0f/b005fe.s.jpg",
        "photoMax": "https://ps-sights.velu.ga/77/0f/b005fe.b.jpg",
        "date": 1556433551,
        "type": 1,
        "latitude": null,
        "longitude": null
      }
    ],
    "comments": [
      {
        "commentId": 107,
        "sightId": 2517,
        "collectionId": null,
        "userId": 1,
        "date": 1598256485,
        "text": "rotate"
      }
    ]
  }
}
```

## feed.getSourceList
Возвращает список пользователей, на которых подписан текущий пользователь.

### Параметры
* `int count = 50` - количество пользователей, которое необходимо вернуть;
* `int offset = 0` - сдвиг выборки;
* `string[]? fields` - [дополнительная информация о пользователях](methods-users.md#user-fields).

### Формат ответа
```ts
type Response = IApiList<IUser>;
```

### Пример ответа
```json5

```
