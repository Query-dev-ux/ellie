# Firebase Admin Cloudflare Worker

Этот Worker позволяет безопасно использовать Firebase Admin SDK без раскрытия учетных данных сервисного аккаунта в клиентском приложении.

## Настройка и деплой

### Шаг 1: Установка Wrangler CLI

```bash
npm install -g wrangler
```

### Шаг 2: Авторизация в Cloudflare

```bash
wrangler login
```

### Шаг 3: Настройка переменных окружения

1. Откройте файл `wrangler.toml` и заполните базовые переменные:

```toml
[vars]
FIREBASE_PROJECT_ID = "ваш-проект-id" # Например "tgbot-29e30"
FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@tgbot-29e30.iam.gserviceaccount.com"
FIREBASE_CLIENT_X509_CERT_URL = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tgbot-29e30.iam.gserviceaccount.com"
```

2. Добавьте секретные переменные, используя команды:

```bash
# Приватный ключ из creds.json
wrangler secret put FIREBASE_PRIVATE_KEY

# ID приватного ключа из creds.json
wrangler secret put FIREBASE_PRIVATE_KEY_ID

# Client ID из creds.json
wrangler secret put FIREBASE_CLIENT_ID
```

### Шаг 4: Деплой Worker'а

```bash
cd workers
wrangler deploy
```

### Шаг 5: Настройка клиентского приложения

После успешного деплоя Worker'а, вы получите URL вида `https://firebase-admin-worker.your-username.workers.dev`.

Обновите константу `API_BASE_URL` в файле `src/hooks/useFirebaseAdmin.ts`:

```typescript
const API_BASE_URL = 'https://firebase-admin-worker.your-username.workers.dev';
```

## Безопасность

- Worker обеспечивает доступ к Firebase Admin SDK без хранения приватных ключей в репозитории или клиентском коде
- Worker предотвращает CORS-атаки, ограничивая доступ только с вашего домена (необходимо обновить параметр `Access-Control-Allow-Origin` в продакшене)
- Все учетные данные хранятся только в переменных окружения Cloudflare

## Расширение API

Если вам потребуются дополнительные методы для работы с Firebase Admin, добавьте соответствующие функции в файл `firebase-admin.js` и обновите API-эндпоинты. 