// Cloudflare Pages Middleware: Case-insensitive URL redirect
// Redirects any uppercase path to lowercase (301 permanent)
// e.g., /coins/BTCUSDT/ -> /coins/btcusdt/
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const lower = path.toLowerCase();

  if (path !== lower) {
    return new Response(null, {
      status: 301,
      headers: { Location: url.origin + lower + url.search },
    });
  }

  return context.next();
}
