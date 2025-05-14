/**
 * Cloudflare Worker для безопасной работы с Firebase Admin SDK
 * Позволяет выполнять админские операции с Firebase, не раскрывая учетные данные
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Конфигурация CORS для безопасности
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // В продакшене замените на ваш домен
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Инициализация Firebase Admin SDK с использованием переменных окружения
let adminApp;
let adminDb;

function initializeFirebaseAdmin() {
  if (!adminApp) {
    const serviceAccountCreds = {
      type: "service_account",
      project_id: env.FIREBASE_PROJECT_ID,
      private_key_id: env.FIREBASE_PRIVATE_KEY_ID,
      private_key: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: env.FIREBASE_CLIENT_EMAIL,
      client_id: env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: env.FIREBASE_CLIENT_X509_CERT_URL
    };

    adminApp = initializeApp({
      credential: cert(serviceAccountCreds),
      databaseURL: `https://${serviceAccountCreds.project_id}.firebaseio.com`
    });

    adminDb = getFirestore(adminApp);
  }
  
  return { adminApp, adminDb };
}

// Обработка CORS preflight запросов
async function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders,
  });
}

// Получение данных пользователя по ID
async function getUserData(userId) {
  const { adminDb } = initializeFirebaseAdmin();
  
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    
    return { 
      success: true, 
      data: userDoc.data() 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Сохранение данных пользователя
async function saveUserData(userId, userData) {
  const { adminDb } = initializeFirebaseAdmin();
  
  try {
    await adminDb.collection('users').doc(userId).set(userData, { merge: true });
    
    return { 
      success: true, 
      message: 'User data saved successfully' 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Основной обработчик запросов
export default {
  async fetch(request, env, ctx) {
    // Обработка CORS preflight запросов
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    // Получаем URL и проверяем маршрут
    const url = new URL(request.url);
    const path = url.pathname.split('/');
    
    // API для работы с данными пользователей
    if (path[1] === 'api' && path[2] === 'users') {
      // Получение данных пользователя: /api/users/{userId}
      if (request.method === 'GET' && path[3]) {
        const userId = path[3];
        const result = await getUserData(userId);
        
        return new Response(JSON.stringify(result), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: result.success ? 200 : 404
        });
      }
      
      // Сохранение данных пользователя: /api/users/{userId}
      if (request.method === 'POST' && path[3]) {
        const userId = path[3];
        
        try {
          const userData = await request.json();
          const result = await saveUserData(userId, userData);
          
          return new Response(JSON.stringify(result), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: result.success ? 200 : 500
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid JSON payload' 
          }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: 400
          });
        }
      }
    }
    
    // Возвращаем 404 для всех других маршрутов
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Not found' 
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 404
    });
  }
}; 