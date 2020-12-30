# Документация / API / Рейтинг
## Список методов API секции rating.*
* [rating.set](#ratingset)

## rating.set
### Параметры
* `int sightId` - идентификатор достопримечательности;
* `int rating` - оценка пользователя от 1 до 5; 0 - снятие оценки.

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