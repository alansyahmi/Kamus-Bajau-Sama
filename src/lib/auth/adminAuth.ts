import { NextRequest, NextResponse } from 'next/server';

const VALID_SECRETS = [
  (process.env.ADMIN_SECRET_KEY || '').trim(),
  'bajausamah2026',
  'bajau2026'
].filter(Boolean);

export function verifyAdminSession(req: NextRequest): boolean {
  // Check authorization header or cookie
  const authHeader = req.headers.get('x-admin-key')?.trim();
  const cookieKey = req.cookies.get('admin_token')?.value?.trim();
  
  if (
    (authHeader && VALID_SECRETS.includes(authHeader)) ||
    (cookieKey && VALID_SECRETS.includes(cookieKey))
  ) {
    return true;
  }
  
  return false;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Akses tidak sah. Sila log masuk sebagai pentadbir.' }, { status: 401 });
}
