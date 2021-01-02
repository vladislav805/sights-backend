# Документация / API / Коллекции
## Список методов API секции collections.*
* [collections.get](#collectionsget)
* [collections.search](#collectionssearch)
* [collections.getById](#collectionsgetbyid)
* [collections.add](#collectionsadd)
* [collections.edit](#collectionsedit)
* [collections.remove](#collectionremove)

## collections.get
Возвращает коллекции пользователя.

### Параметры
* `int ownerId` - идентификатор автора коллекций;
* `int count = 50` - количество элементов, которое необходимое вернуть;
* `int offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiList<ICollection>;
```

### Пример ответа
```json5

```


## collections.search
Поиск по коллекциям.

### Параметры
* `string query` - поисковый запрос;
* `int? cityId` - идентификатор города.

### Формат ответа
```ts
type Response = IApiList<ICollection>;
```

### Пример ответа
```json5

```


## collections.getById
Возвращает коллекцию и полное её содержание по её идентификатору. 

### Параметры
* `string collectionId` - поисковый запрос;
* `boolean onlyInformation = false` - `true`, если нужно получить только базовую информацию (иначе будет возвращён список с достопримечательностями в поле items).

### Формат ответа
```ts
type Response = ICollectionExtended;
```

### Пример ответа
```json5

```


## collections.add
Создаёт коллекцию.

### Параметры
* `string title` - название коллекции;
* `string type` - тип коллекции:
    * `PUBLIC` - публичная;
    * `DRAFT` - черновик (доступен только автору).
* `string content` - описание/текст коллекции в формате Markdown;
* `int? cityId` - идентификатор города, если коллекция привязана к городу.

### Формат ответа
```ts
type Response = ICollection;
```

### Пример ответа
```json5

```


## collections.edit
Редактирует коллекцию.

### Параметры
* `int collectionId` - идентификатор коллекции;
* `string title` - название коллекции;
* `string type` - тип коллекции:
    * `PUBLIC` - публичная;
    * `DRAFT` - черновик (доступен только автору).
* `string content` - описание/текст коллекции в формате Markdown;
* `int? cityId` - идентификатор города, если коллекция привязана к городу.

### Формат ответа
```ts
type Response = ICollection;
```

### Пример ответа
```json5

```


## collection.remove
Удаляет коллекцию.

### Параметры
* `int collectionId` - идентификатор коллекции.

### Формат ответа
```ts
type Response = boolean;
```

### Пример ответа
```json5

```
