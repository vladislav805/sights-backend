# Документация / API / Фотографии
## Список методов API секции photos.*
* [photos.get](#photosget)
* [photos.getById](#photosgetbyid)
* photos.getUploadUri
* photos.save
* [photos.getUnsorted](#photosgetunsorted)
* [photos.remove](#photosremove)
* photos.suggest
* photos.approve
* photos.decline

## photos.get
### Параметры
* `int? sightId` - идентификатор достопримечательности, если нужно вернуть фотографии достопримечательности.

### Формат ответа
```ts
type Response = IApiList<IPhoto>;
``` 

### Пример ответа
```json5

```

## photos.getById
### Параметры
* `int[] photoIds` - идентификаторы фотографий через запятую, информацию о которых нужно получить.

### Формат ответа
```ts
type Response = IPhoto[];
```

### Пример ответа
```json5

```

## photos.getUploadUri
### Параметры
* `string type` - тип фотографии:
    * `sight` - для последующего добавления к достопримечательности;
    * `profile` - для последующей замены фотографии в профиле пользователя;

### Формат ответа
```ts
type Response = {
    uri: string;
};
```

### Пример ответа
```json5

```

## photos.save
### Параметры

### Формат ответа
```ts
type Response = IPhoto;
```

### Пример ответа
```json5

```

## photos.getUnsorted
### Параметры
* `int? count = 50` - количество фотографий, необходимых для получения;
* `int? offset = 0` - сдвиг выборки.

### Формат ответа
```ts
type Response = IApiList<IPhoto>;
```

### Пример ответа
```json5

```

## photos.remove
### Параметры
* `int photoId` - идентификатор фотографии.

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

## photos.suggest
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int photoId` - идентификатор фотографии.

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

## photos.approve
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int photoId` - идентификатор фотографии.

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

## photos.decline
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int photoId` - идентификатор фотографии.

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
