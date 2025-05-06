const fs = require('fs');
const path = require('path');

// Создаем файл _routes.json для Cloudflare Pages
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: []
};

fs.writeFileSync(
  path.join(process.cwd(), 'out', '_routes.json'),
  JSON.stringify(routesConfig, null, 2)
);

console.log('✅ Created _routes.json for Cloudflare Pages');

// Создаем пустой файл .nojekyll для GitHub Pages
fs.writeFileSync(
  path.join(process.cwd(), 'out', '.nojekyll'),
  ''
);

console.log('✅ Created .nojekyll file for GitHub Pages compatibility'); 