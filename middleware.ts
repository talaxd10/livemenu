// Route protection is handled server-side in each layout via auth() from @/lib/auth.
// Middleware is intentionally kept as a no-op to avoid Auth.js v5/Edge runtime issues.

export function middleware() {}

export const config = {
  matcher: [],
};
