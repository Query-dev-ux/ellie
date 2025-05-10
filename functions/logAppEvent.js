const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Константы для подключения к Google Sheets
const SPREADSHEET_ID = '168uF2e_E7AoV3egu5yTcb_-OPNy4Cs3PWUM5xE7nrLM'; // ID вашей таблицы
const SHEET_NAME = 'TelegramBotLogs'; // Название листа для логов мини-приложения

/**
 * Функция для логирования событий мини-приложения в Google Sheets
 * Может быть развернута как Cloudflare Worker, Azure Function, или Google Cloud Function
 */
module.exports = async function(context, req) {
  // Установка CORS заголовков для доступа с мини-приложения
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Обработка preflight запросов OPTIONS
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers
    };
    return;
  }

  try {
    // Проверка наличия тела запроса
    if (!req.body) {
      context.res = {
        status: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
      return;
    }

    // Получение данных для логирования
    const { event, userId, username, timestamp, additionalData } = req.body;

    if (!event) {
      context.res = {
        status: 400,
        headers,
        body: JSON.stringify({ error: 'Event name is required' })
      };
      return;
    }

    // Данные для сервисного аккаунта Google (должны быть безопасно сохранены в переменных окружения)
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Подключение к Google Sheets
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Получение или создание листа для логов
    let sheet = doc.sheetsByTitle[SHEET_NAME];
    if (!sheet) {
      // Если лист не существует, создаем его с правильными заголовками
      sheet = await doc.addSheet({ title: SHEET_NAME, headerValues: [
        'Date', 'User ID', 'Username', 'Action', 'Source', 'Additional Data'
      ]});
    }

    // Подготовка данных для записи в соответствии с заголовками таблицы
    const rowData = {
      'Date': timestamp || new Date().toISOString(),
      'User ID': userId || 'unknown',
      'Username': username || 'unknown',
      'Action': event,
      'Source': 'mini_app',
      'Additional Data': additionalData ? JSON.stringify(additionalData) : ''
    };

    // Добавление строки в таблицу
    await sheet.addRow(rowData);

    // Возвращаем успешный ответ
    context.res = {
      status: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Event logged successfully' })
    };
  } catch (error) {
    console.error('Error logging event:', error);
    
    // Возвращаем ошибку
    context.res = {
      status: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to log event', details: error.message })
    };
  }
}; 