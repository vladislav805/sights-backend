# Документация / API / Фотографии
## Список методов API секции photos.*
* [photos.get](#photosget)
* [photos.getById](#photosgetbyid)
* [photos.getUploadUri](#photosgetuploaduri)
* [photos.save](#photossave)
* [photos.getUnsorted](#photosgetunsorted)
* [photos.remove](#photosremove)
* [photos.suggest](#photossuggest)
* [photos.approve](#photosapprove)
* [photos.decline](#photosdecline)

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
    * `1` - для последующего добавления к достопримечательности;
    * `2` - для последующей замены фотографии в профиле пользователя;
    * `4` - для последующего добавления к достопримечательности в целях "предложения".

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
* `string payload` - строка с данными, которую вернул сервер загрузки;
* `string sig` - строка-подпись, которую вернул сервер загрузки. 

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
