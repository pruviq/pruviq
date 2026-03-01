/**
 * Cloudflare Pages Advanced Mode Worker
 * - Handles case-insensitive coin URL redirects (e.g. /coins/BTCUSDT/ → /coins/btcusdt/)
 * - Passes all other requests through to static assets
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Redirect /coins/UPPERCASE paths to lowercase (301)
    if (/^\/(?:ko\/)?coins\/[^/]*[A-Z]/.test(url.pathname)) {
      url.pathname = url.pathname.toLowerCase();
      return Response.redirect(url.toString(), 301);
    }

    // Serve static assets for everything else
    return env.ASSETS.fetch(request);
  },
};
