import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Используем переменные окружения вместо импорта файла
// Эти данные будут заполнены при деплое на сервер
const serviceAccountCreds = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "tgbot-29e30",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "", 
  private_key: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@tgbot-29e30.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tgbot-29e30.iam.gserviceaccount.com"
};

// Инициализация Firebase Admin SDK с учетными данными сервисного аккаунта
const adminApp = initializeApp({
  credential: cert(serviceAccountCreds as any),
  databaseURL: `https://${serviceAccountCreds.project_id}.firebaseio.com`
});

// Получение инстанса Firestore для админ-доступа
const adminDb = getFirestore(adminApp);

export { adminApp, adminDb }; 