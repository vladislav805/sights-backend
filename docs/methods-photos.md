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
* [photos.getRandom](#photosgetrandom)

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

## photos.getRandom
Возвращает несколько случайных фотографий. Используется для показа на главной странице сайта.

### Параметры
* `int count` - количество фотографий, которое нужно вернуть (от одной до двадцати).

### Формат ответа
```ts
type Response = {
    sightId: number;
    photo: IPhoto;
}[];
```

### Пример ответа
```json5
{
  "result": [{
      "sightId": 660,
      "photo": {
          "photoId": 92,
          "ownerId": 1,
          "type": 1,
          "date": 1521379851,
          "latitude": 59.7890935,
          "longitude": 30.1474111,
          "photo200": "https://ps-sights.velu.ga/f1/8c/412464.s.jpg",
          "photoMax": "https://ps-sights.velu.ga/f1/8c/412464.b.jpg",
          "width": 1400,
          "height": 1050
      }
  }]
}
```
