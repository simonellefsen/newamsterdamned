// The whole game is client-side data — nothing to render per-request, so prerender the
// shell to a static file and let the CDN serve it.
export const prerender = true;
export const ssr = false;
