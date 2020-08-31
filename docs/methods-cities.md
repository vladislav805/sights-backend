# Документация / API / Города
## cities
* [cities.get](#citiesget)
* [cities.getById](#citiesgetbyid)

## cities.get
### Параметры
* `int? count = 50` - количество городов, которые необходимо вернуть;
* `int? offset = 0` - сдвиг выборки;
* `boolean? all = false` - вернуть все города (иначе - только крупные);
* `boolean? extended = false` - возвращать ли дополнительные поля о городе.

### Ответ
```ts
type Response = IApiList<ICity>;
```

## cities.getById
### Параметры
* `int[] cityIds` - идентификаторы городов, которые необходимо получить;
* `boolean? extended = false` - возвращать ли дополнительные поля о городе.

### Ответ
```ts
type Response = ICity[];
```
