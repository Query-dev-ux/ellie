import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Предоставляем пустые значения для process.env переменных
    // Эти данные будут заполнены при деплое
    'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID || ''),
    'process.env.FIREBASE_PRIVATE_KEY_ID': JSON.stringify(process.env.FIREBASE_PRIVATE_KEY_ID || ''), 
    'process.env.FIREBASE_PRIVATE_KEY': JSON.stringify(process.env.FIREBASE_PRIVATE_KEY || ''),
    'process.env.FIREBASE_CLIENT_EMAIL': JSON.stringify(process.env.FIREBASE_CLIENT_EMAIL || ''),
    'process.env.FIREBASE_CLIENT_ID': JSON.stringify(process.env.FIREBASE_CLIENT_ID || ''),
    'process.env.FIREBASE_CLIENT_X509_CERT_URL': JSON.stringify(process.env.FIREBASE_CLIENT_X509_CERT_URL || '')
  }
})
