# Документация / Объекты API
## Список объектов
* [IUser](#iuser)
* ICity
* ISight
* ICategory
* IField
* ITag
* IPhoto
* IComment
* INotification
* [IApiList<T>](#iapilistlttgt)
* [IApiListExtended<T>](#iapilistextendedlttgt)

## IUser
Информация о пользователе

| Название поля | Тип | Описание |
|:-------------:|:-----:|-------|
| `userId` | `int` | Идентификатор пользователя |
| `login` | `string` | Логин |
| `firstName` | `string` | Имя |
| `lastName` | `string` | Фамилия |
| `sex` | `0  1  2` | Пол |
| `lastSeen` | `int` | Дата последнего нахождения пользователя в онлайне |
| `isOnline` | `boolean?` | Находится ли пользователь сейчас на сайте |
| `status` | `'INACTIVE' | 'USER' | 'MODERATOR' | 'ADMIN' | 'BANNED'` | Статус пользователя |
| `bio` | `string` | О себе |
| `photo` | `IPhoto` | **Только при передаче `fields=ava`**. Объект текущей фотографии пользователя. |
| `city` | `ICity` | **Только при передаче `fields=city`**. Объект города пользователя. |
| `followers` | `int` | **Только при передаче `fields=followers`**. Количество подписчиков пользователя. |
| `isFollowed` | `boolean` | **Только при передаче `authKey` и `fields=isFollowed`**. Подписан ли текущий пользователь на запрашиваемого пользователя. |
  
## IApiList&lt;T&gt;
Список с объектами типа `T` в свойстве `items`. Также обычно содержит поле `count`, отображающее полное количество объектов.
```ts
interface IApiList<T> {
    count?: number;
    items: T[];
}
```

## IApiListExtended&lt;T&gt;
Расширенный список `IApiList<T>` объектов типа `T`, содержащий также информацию о пользователях. 
```ts
interface IApiListExtended<T> extends IApiList<T> {
    users: IUser[];
}
```