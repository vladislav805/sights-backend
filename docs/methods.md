# Документация / API
## Секции методов API
* [users.*](methods-users.md) - информация о пользователях;
* [account.*](methods-account.md) - информация об аккаунте;
* [cities.*](methods-cities.md) - информация о городах;
* [map.*](methods-map.md) - информация о карте;
* [sights.*](methods-sights.md) - информация о достопримечательностях;
* [categories.*](methods-categories.md) - информация о категориях;
* [fields.*](methods-fields.md) - информация о полях;
* [tags.*](methods-tags.md) - информация о тегах;
* [photos.*](methods-photos.md) - информация о фотографиях;
* [comments.*](methods-comments.md) - информация о комментариях;
* [feed.*](methods-feed.md) - новости;
* [notifications.*](methods-notifications.md) - уведомления;
* [collections.*](methods-collections.md) - информация о коллекциях.

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