// Константы для подключения к Google Sheets
const SPREADSHEET_ID = '168uF2e_E7AoV3egu5yTcb_-OPNy4Cs3PWUM5xE7nrLM'; // ID таблицы
const SHEET_NAME = 'TelegramBotLogs'; // Название листа для логов

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
    console.log('[logAppEvent] Processing log request');
    
    // Парсим тело запроса
    let bodyData;
    try {
      bodyData = await request.json();
    } catch (error) {
      console.error('[logAppEvent] Error parsing request body:', error);
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
    let { event, userId, username, timestamp, additionalData } = bodyData;
    
    console.log('[logAppEvent] Log data received:', { event, userId, username });
    
    // Проверка URL-параметров в additionalData
    const urlParams = additionalData?.urlParams || '';
    if ((!userId || !username) && urlParams) {
      console.log('[logAppEvent] Checking URL parameters:', urlParams);
      try {
        // Извлекаем параметры из URL
        const params = new URLSearchParams(urlParams);
        if (params.has('userId')) {
          const paramUserId = params.get('userId');
          console.log(`[logAppEvent] Found userId in URL: ${paramUserId}`);
          if (!userId) {
            userId = parseInt(paramUserId, 10);
          }
        }
        
        if (params.has('username') && !username) {
          username = params.get('username');
          console.log(`[logAppEvent] Found username in URL: ${username}`);
        }
      } catch (error) {
        console.error('[logAppEvent] Error parsing URL parameters:', error);
      }
    }
    
    // Попытка извлечь информацию о пользователе из дополнительных данных, если основные данные отсутствуют
    if ((!userId || !username) && additionalData) {
      console.log('[logAppEvent] Attempting to extract user info from additionalData');
      
      // Проверяем, есть ли у нас данные об извлеченном пользователе
      if (additionalData.extractedUserId || additionalData.extractedUsername) {
        console.log('[logAppEvent] Found extracted user data:', {
          extractedUserId: additionalData.extractedUserId,
          extractedUsername: additionalData.extractedUsername
        });
        
        // Используем извлеченные данные, если основные отсутствуют
        userId = userId || additionalData.extractedUserId;
        username = username || additionalData.extractedUsername;
      }
      
      // Ищем в debug информации
      if ((!userId || !username) && additionalData.debug) {
        console.log('[logAppEvent] Debug info available, checking for user data');
        
        if (additionalData.debug.extractedUserId || additionalData.debug.extractedUsername) {
          userId = userId || additionalData.debug.extractedUserId;
          username = username || additionalData.debug.extractedUsername;
        }
        
        // Логируем всю отладочную информацию для анализа
        console.log('[logAppEvent] Debug info:', additionalData.debug);
      }
      
      // Ищем в rawInitDataSample подстроку "user":
      if ((!userId || !username) && additionalData.rawInitDataSample) {
        console.log('[logAppEvent] Analyzing rawInitDataSample for user info');
        
        // Проверяем, содержит ли образец initData что-то про user
        if (additionalData.rawInitDataSample.includes('user')) {
          console.log('[logAppEvent] Found "user" in rawInitDataSample');
        }
      }
      
      // Ищем в launchDiagnostics данные о пользователе
      if ((!userId || !username) && additionalData.launchDiagnostics) {
        console.log('[logAppEvent] Checking launchDiagnostics for user info');
        
        const diag = additionalData.launchDiagnostics;
        if (diag.userIdFromURL) {
          userId = userId || parseInt(diag.userIdFromURL, 10);
          console.log(`[logAppEvent] Found userId in launchDiagnostics: ${userId}`);
        }
        
        if (diag.usernameFromURL) {
          username = username || diag.usernameFromURL;
          console.log(`[logAppEvent] Found username in launchDiagnostics: ${username}`);
        }
      }
    }

    // Проверка наличия переменных окружения
    if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
      console.error('[logAppEvent] Missing environment variables for Google Service Account');
      
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error', 
          message: 'Google Service Account credentials not configured'
        }),
        { status: 500, headers }
      );
    }

    console.log('[logAppEvent] Environment variables found');

    try {
      // Подготовка данных для записи
      const now = timestamp || new Date().toISOString();
      const userIdStr = userId ? userId.toString() : 'unknown';
      const usernameStr = username || 'unknown';
      const sourceStr = 'mini_app';
      
      // Сделаем копию additionalData, чтобы не изменять исходный объект
      const additionalDataCopy = { ...additionalData };
      
      // Извлекаем данные о языке, стране и устройстве
      let country = 'unknown';
      let device = 'unknown';
      
      if (additionalDataCopy) {
        // Получаем язык/локаль из navigator.language
        if (additionalDataCopy.language) {
          // Используем полный код локали как значение country
          country = additionalDataCopy.language;
          
          // Удаляем поле из additionalData, чтобы оно не дублировалось
          delete additionalDataCopy.language;
        }
        
        // Определяем устройство из userAgent
        if (additionalDataCopy.userAgent) {
          const ua = additionalDataCopy.userAgent.toLowerCase();
          if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
            device = 'iOS';
          } else if (ua.includes('android')) {
            device = 'Android';
          } else if (ua.includes('windows')) {
            device = 'Windows';
          } else if (ua.includes('macintosh') || ua.includes('mac os')) {
            device = 'Mac';
          } else if (ua.includes('linux')) {
            device = 'Linux';
          }
          
          // Удаляем userAgent из additionalData, чтобы сократить объем данных
          delete additionalDataCopy.userAgent;
        }
        
        // Если переданы конкретные значения, используем их
        if (additionalDataCopy.device) {
          device = additionalDataCopy.device;
          delete additionalDataCopy.device;
        }
        
        if (additionalDataCopy.country) {
          country = additionalDataCopy.country;
          delete additionalDataCopy.country;
        }
        
        // Удаляем поля, которые теперь обрабатываются отдельно
        if (additionalDataCopy.platform) {
          delete additionalDataCopy.platform;
        }
      }
      
      // Конвертируем очищенные additionalData в строку
      const additionalDataStr = Object.keys(additionalDataCopy || {}).length > 0 
        ? JSON.stringify(additionalDataCopy) 
        : '';
      
      // Подготавливаем массив в соответствии с новым порядком столбцов в таблице
      // A - Date, B - User ID, C - Username, D - Country, E - Device, F - Action, G - Source, H - Additional Data
      const values = [
        [
          now,              // Date (A)
          userIdStr,        // User ID (B)
          usernameStr,      // Username (C)
          country,          // Country (D) - полный код локали
          device,           // Device (E)
          event,            // Action (F)
          sourceStr,        // Source (G)
          additionalDataStr // Additional Data (H)
        ]
      ];
      
      console.log('[logAppEvent] Preparing to send data to Google Sheets:', values[0]);
      
      // Создаем JWT токен для аутентификации
      const token = await createJWT(
        env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        'https://www.googleapis.com/auth/spreadsheets'
      );
      
      console.log('[logAppEvent] JWT token created');
      
      // URL для Google Sheets API
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:H:append?valueInputOption=USER_ENTERED`;
      
      // Отправляем запрос к Google Sheets API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: values
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('[logAppEvent] Row added successfully:', responseData);

      // Возвращаем успешный ответ
      return new Response(
        JSON.stringify({ success: true, message: 'Event logged successfully' }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error('[logAppEvent] Error with Google Sheets operation:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Google Sheets operation failed', 
          message: error.message,
          stack: error.stack
        }),
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('[logAppEvent] Unhandled error:', error);
    
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

/**
 * Создает JWT токен для аутентификации в Google API
 */
async function createJWT(email, privateKey, scope) {
  // Текущее время в секундах
  const now = Math.floor(Date.now() / 1000);
  
  // Срок действия токена - 1 час
  const exp = now + 3600;
  
  // Формируем заголовок JWT
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  // Формируем полезную нагрузку (payload)
  const payload = {
    iss: email,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: exp,
    iat: now
  };
  
  // Кодируем header и payload в base64
  const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  // Формируем строку для подписи
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Создаем подпись с использованием privateKey
  const textEncoder = new TextEncoder();
  const importedKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' }
    },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    importedKey,
    textEncoder.encode(signatureInput)
  );
  
  // Преобразуем подпись в base64url
  const encodedSignature = arrayBufferToBase64Url(signature);
  
  // Формируем JWT токен
  const jwt = `${signatureInput}.${encodedSignature}`;
  
  // Получаем OAuth2 токен с помощью JWT
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`OAuth token error: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * Преобразует PEM-формат приватного ключа в ArrayBuffer
 */
function pemToArrayBuffer(pem) {
  // Убираем заголовок и подвал PEM-файла и все переносы строк
  const base64 = pem.replace(/-{5}BEGIN PRIVATE KEY-{5}/, '')
                   .replace(/-{5}END PRIVATE KEY-{5}/, '')
                   .replace(/\n/g, '');
                   
  // Декодируем Base64 в ArrayBuffer
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Преобразует ArrayBuffer в base64url
 */
function arrayBufferToBase64Url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
} 