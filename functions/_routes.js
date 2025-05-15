export default {
  async fetch(request, env, ctx) {
    // Получаем путь из URL
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log(`[_routes] Processing request for path: ${path}`);
    
    // Маршрутизируем запросы на соответствующие функции
    if (path === '/api/logAppEvent') {
      const { onRequest } = await import('./logAppEvent.js');
      return onRequest({ request, env, ctx });
    }
    
    // Если путь не соответствует ни одной функции, возвращаем 404
    return new Response('Not Found', { status: 404 });
  }
}; 