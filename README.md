# Telegram Mini App с Firebase Firestore и Analytics

## О приложении
Мини-приложение для Telegram, которое представляет собой игру-симулятор флирта. Приложение использует Firebase Firestore для хранения данных пользователей, результатов игры и настроек, а также Firebase Analytics для аналитики.

## Установка и настройка

### Шаг 1: Клонирование репозитория
```bash
git clone <url-репозитория>
cd <директория-проекта>
```

### Шаг 2: Установка зависимостей
```bash
npm install
```

### Шаг 3: Настройка Firebase

Firebase уже настроен со следующей конфигурацией:

```typescript
// src/firebase/config.ts
const firebaseConfig = {
  apiKey: "AIzaSyBZii_8SQwkdzKaRAT4lJZ-zgED8EduzgA",
  authDomain: "tgbot-29e30.firebaseapp.com",
  projectId: "tgbot-29e30",
  storageBucket: "tgbot-29e30.firebasestorage.app",
  messagingSenderId: "72277336797",
  appId: "1:72277336797:web:389b024ac1575c610eb134",
  measurementId: "G-HLKG4KF088"
};
```

## Параметры URL

Приложение поддерживает следующие параметры URL:

| Параметр   | Описание                                    | Пример                     |
|------------|---------------------------------------------|----------------------------|
| a_userId   | ID пользователя (обязательный параметр)     | `a_userId=123456789`       |
| b_username | Имя пользователя                            | `b_username=username`      |
| c_country  | Страна пользователя                         | `c_country=RU`             |
| d_device   | Устройство пользователя                     | `d_device=iOS`             |
| e_source   | Источник перехода                           | `e_source=bot`             |
| f_actions  | Массив действий пользователя (JSON-строка)  | `f_actions=%5B%7B%22type%22%3A%22open%22%2C%22timestamp%22%3A%222023-07-01T12%3A00%3A00Z%22%7D%5D` |

Пример URL с параметрами:
```
https://your-app.com/?a_userId=123456789&b_username=john_doe&c_country=US&d_device=iPhone&e_source=telegram_bot
```

### Структура действий пользователя (f_actions)

Параметр `f_actions` должен быть закодированной JSON-строкой, содержащей массив объектов действий:

```typescript
interface UserAction {
  type: string;       // Тип действия
  timestamp: string;  // Время действия в формате ISO
  data?: any;         // Дополнительные данные (опционально)
}
```

Пример (до URL-кодирования):
```json
[
  {
    "type": "open_app",
    "timestamp": "2023-07-01T12:00:00Z"
  },
  {
    "type": "button_click",
    "timestamp": "2023-07-01T12:01:30Z",
    "data": {
      "button_id": "start_game"
    }
  }
]
```

## Запуск приложения

### Разработка
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

### Деплой
```bash
npm run deploy
```

## Структура Firebase Firestore

### Коллекция gameResults
Хранит результаты игр пользователей:
- `userId`: ID пользователя в Telegram (строка)
- `username`: Имя пользователя в Telegram
- `totalScore`: Общий счет за игру
- `stages`: Объект с данными о выборах на каждом этапе
- `createdAt`: Дата создания записи
- `deviceInfo`: Информация об устройстве
- `country`: Страна пользователя
- `device`: Устройство пользователя
- `source`: Источник перехода

### Коллекция userSettings
Хранит пользовательские настройки:
- `userId`: ID пользователя в Telegram (строка)
- `username`: Имя пользователя в Telegram
- `language`: Предпочитаемый язык
- `theme`: Тема оформления
- `notifications`: Статус уведомлений
- `lastVisit`: Дата последнего посещения
- `country`: Страна пользователя
- `device`: Устройство пользователя
- `source`: Источник перехода

## Firebase Analytics

Приложение настроено для отправки событий в Firebase Analytics:

- `app_open`: При открытии приложения
- `get_document`: При получении документа из Firestore
- `get_collection`: При получении коллекции из Firestore
- `add_document`: При добавлении документа в Firestore
- `set_document`: При установке документа в Firestore
- `update_document`: При обновлении документа в Firestore
- `delete_document`: При удалении документа из Firestore
- `error`: При возникновении ошибок

Все события содержат данные о пользователе, устройстве и источнике перехода.

## Отладка

Приложение включает страницу отладки, доступную по URL `/debug`. На этой странице отображается:

- Все параметры URL
- Данные пользователя
- Статус Telegram WebApp
- Информация о системе

## Дополнительная информация

- Для работы с Firestore используется хук `useFirestore` в `src/hooks/useFirestore.ts`
- Обработка параметров URL происходит в `src/hooks/useUrlParams.ts`
- Обработка пользовательских данных из Telegram происходит в `src/hooks/useTelegram.ts`
- Навигация по разделам реализована с помощью React Router
