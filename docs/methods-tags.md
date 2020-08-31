# Документация / API / Теги
## Список методов API секции tags.*
* [tags.get](#tagsget)
* [tags.getById](#tagsgetbyid)
* [tags.search](#tagssearch)

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
