// Скрипт для копирования файлов конфигурации в директорию dist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Убедимся, что директория dist существует
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Копируем _routes.json в dist
try {
  fs.copyFileSync('_routes.json', path.join('dist', '_routes.json'));
  console.log('✅ _routes.json скопирован в директорию dist');
} catch (err) {
  console.error('❌ Ошибка при копировании _routes.json:', err);
}

// Создадим пустой файл .well-known/workers.js для работы с Workers
const wellKnownDir = path.join('dist', '.well-known');
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

try {
  fs.writeFileSync(path.join(wellKnownDir, 'workers.js'), '// workers config');
  console.log('✅ .well-known/workers.js создан');
} catch (err) {
  console.error('❌ Ошибка при создании .well-known/workers.js:', err);
} 