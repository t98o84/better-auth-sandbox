import { createMiddleware } from 'hono/factory';
import { auth, type AuthType } from '../lib/auth.js';

export const sessionMiddleware = createMiddleware<{
  Variables: AuthType;
}>(async (c, next) => {
  // リクエストヘッダーをそのまま渡す（Cookie ヘッダーが含まれる）
  console.log('[Session] Path:', c.req.path, 'Cookie:', c.req.header('Cookie')?.substring(0, 100));
  
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  console.log('[Session] Result:', session ? `Found (${session.user?.email})` : 'Not found');

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    await next();
    return;
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});
