// Скрипт для копирования файлов конфигурации в директорию dist
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

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

// Создадим директорию functions в dist
const distFunctionsDir = path.join('dist', 'functions');
if (!fs.existsSync(distFunctionsDir)) {
  fs.mkdirSync(distFunctionsDir, { recursive: true });
}

// Копируем файлы из директории functions в dist/functions
try {
  const functionFiles = fs.readdirSync('functions');
  functionFiles.forEach((file) => {
    if (file.endsWith('.js')) {
      fs.copyFileSync(
        path.join('functions', file),
        path.join(distFunctionsDir, file)
      );
      console.log(`✅ ${file} скопирован в директорию dist/functions`);
    }
  });
} catch (err) {
  console.error('❌ Ошибка при копировании файлов functions:', err);
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

// Копируем node_modules для functions, если они есть
const functionNodeModules = path.join('functions', 'node_modules');
if (fs.existsSync(functionNodeModules)) {
  const distNodeModules = path.join(distFunctionsDir, 'node_modules');
  
  try {
    // Рекурсивное копирование директории node_modules
    copyDirectorySync(functionNodeModules, distNodeModules);
    console.log('✅ node_modules для functions скопирован');
  } catch (err) {
    console.error('❌ Ошибка при копировании node_modules:', err);
  }
}

/**
 * Рекурсивное копирование директории
 */
function copyDirectorySync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    const stat = fs.statSync(sourcePath);

    if (stat.isFile()) {
      fs.copyFileSync(sourcePath, destPath);
    } else if (stat.isDirectory()) {
      copyDirectorySync(sourcePath, destPath);
    }
  });
} 