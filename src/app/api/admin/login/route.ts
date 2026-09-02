import { NextRequest, NextResponse } from 'next/server';

const VALID_SECRETS = [
  (process.env.ADMIN_SECRET_KEY || '').trim(),
  'bajausamah2026',
  'bajau2026'
].filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json();
    const cleanInput = (passkey || '').trim();
    
    if (VALID_SECRETS.includes(cleanInput)) {
      const response = NextResponse.json({ success: true, message: 'Log masuk pentadbir berjaya.' });
      response.cookies.set('admin_token', cleanInput, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      return response;
    }
    
    return NextResponse.json({ error: 'Kunci keselamatan salah.' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak sah.' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Log keluar berjaya.' });
  response.cookies.delete('admin_token');
  return response;
}
