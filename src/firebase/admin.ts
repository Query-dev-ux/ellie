import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../creds/creds.json';

// Инициализация Firebase Admin SDK с учетными данными сервисного аккаунта
const adminApp = initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

// Получение инстанса Firestore для админ-доступа
const adminDb = getFirestore(adminApp);

export { adminApp, adminDb }; 