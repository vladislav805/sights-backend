# Документация / API / Рейтинг
## Список методов API секции rating.*
* [rating.set](#ratingset)

## rating.set
### Параметры
* `int? sightId` - идентификатор достопримечательности (обязателен, если не указан `collectionid`);
* `int? collectionId` - идентификатор коллекции (обязателен, если не указан `sightId`);
* `int rating` - оценка пользователя от 1 до 5 или 0 для снятия оценки.

### Формат ответа
```ts
type Response = {
    value: number; // рейтинг
    count: number; // количество оценок
    rated: number; // оценка текущего юзера
};
```

### Пример ответа
```json5
{
    "result": {
        "value": 4.5,
        "count": 2,
        "rated": 5
    }
}
```
