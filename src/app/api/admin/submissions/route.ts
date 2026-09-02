import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const list = db.select().from(submissions).orderBy(desc(submissions.createdAt)).all();
    return NextResponse.json({ submissions: list });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Gagal mendapatkan senarai sumbangan.' }, { status: 500 });
  }
}
