# Документация / API / Категории
## Список методов API секции categories.*
* [categories.get](#categoriesget)
* [categories.getById](#categoriesgetbyid)

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
