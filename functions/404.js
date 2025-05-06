export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  try {
    // Перенаправляем все запросы на index.html для SPA
    const response = await context.env.ASSETS.fetch(new URL("/index.html", url));
    return response;
  } catch (e) {
    return new Response("Not Found", { status: 404 });
  }
} 