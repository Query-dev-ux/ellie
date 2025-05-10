const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Константы для подключения к Google Sheets
const SPREADSHEET_ID = '168uF2e_E7AoV3egu5yTcb_-OPNy4Cs3PWUM5xE7nrLM'; // ID вашей таблицы
const SHEET_NAME = 'TelegramBotLogs'; // Название листа для логов мини-приложения

/**
 * Функция для логирования событий мини-приложения в Google Sheets
 */
export async function onRequest(context) {
  const { request, env } = context;
  
  // Установка CORS заголовков для доступа с мини-приложения
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Обработка preflight запросов OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  try {
    console.log('Processing log request');
    
    // Парсим тело запроса
    let bodyData;
    try {
      bodyData = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers }
      );
    }

    // Проверка наличия обязательных данных
    if (!bodyData || !bodyData.event) {
      return new Response(
        JSON.stringify({ error: 'Event name is required' }),
        { status: 400, headers }
      );
    }

    // Получение данных для логирования
    const { event, userId, username, timestamp, additionalData } = bodyData;
    
    console.log('Log data received:', { event, userId, username });

    // Проверка наличия переменных окружения
    if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
      console.error('Missing environment variables for Google Service Account');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error', 
          message: 'Google Service Account credentials not configured'
        }),
        { status: 500, headers }
      );
    }

    // Данные для сервисного аккаунта Google
    const serviceAccountAuth = new JWT({
      email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('Connecting to Google Sheets');
    
    // Подключение к Google Sheets
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Получение или создание листа для логов
    let sheet = doc.sheetsByTitle[SHEET_NAME];
    if (!sheet) {
      console.log('Sheet not found, creating new one');
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

    console.log('Adding row to sheet:', rowData);
    
    // Добавление строки в таблицу
    await sheet.addRow(rowData);

    // Возвращаем успешный ответ
    return new Response(
      JSON.stringify({ success: true, message: 'Event logged successfully' }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error logging event:', error);
    
    // Возвращаем ошибку
    return new Response(
      JSON.stringify({ 
        error: 'Failed to log event', 
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers }
    );
  }
} 