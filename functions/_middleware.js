export async function onRequest(context) {
  const { request, next, env } = context;
  
  // Пропускаем запросы к статическим файлам
  const url = new URL(request.url);
  if (url.pathname.match(/\.\w+$/)) {
    return await next();
  }
  
  try {
    // Обрабатываем остальные запросы
    return await next();
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
} 