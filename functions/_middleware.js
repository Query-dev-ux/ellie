export async function onRequest(context) {
  // Маршрутизация для SPA приложения
  const url = new URL(context.request.url);
  
  // Если запрашивается статический файл, пропускаем
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return context.next();
  }

  // Для всех остальных путей возвращаем index.html
  try {
    const response = await context.env.ASSETS.fetch(new URL("/index.html", url));
    return response;
  } catch (e) {
    return new Response("Not Found", { status: 404 });
  }
} 