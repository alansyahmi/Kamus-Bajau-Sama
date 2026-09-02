import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { examples } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const id = parseInt(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });
    }

    const body = await req.json();
    const { sentenceBajau, highlightWord, sentenceMs, sentenceEn } = body;

    if (!sentenceBajau || !sentenceMs) {
      return NextResponse.json(
        { error: 'Ayat Bajau Samah dan terjemahan Melayu diperlukan.' },
        { status: 400 }
      );
    }

    db.update(examples)
      .set({
        sentenceBajau: sentenceBajau.trim(),
        highlightWord: highlightWord ? highlightWord.trim() : null,
        sentenceMs: sentenceMs.trim(),
        sentenceEn: sentenceEn ? sentenceEn.trim() : null,
      })
      .where(eq(examples.id, id))
      .run();

    return NextResponse.json({
      success: true,
      message: 'Ayat contoh berjaya dikemas kini.',
    });
  } catch (error: any) {
    console.error('Error updating example sentence:', error);
    return NextResponse.json({ error: 'Gagal mengemas kini ayat contoh.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const id = parseInt(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak sah.' }, { status: 400 });
    }

    const ex = db.select().from(examples).where(eq(examples.id, id)).get();
    if (!ex) {
      return NextResponse.json({ error: 'Ayat contoh tidak dijumpai.' }, { status: 404 });
    }

    // Delete associated audio file if it exists
    if (ex.audioUrl) {
      const cleanPath = ex.audioUrl.split('?')[0];
      const filePath = path.join(process.cwd(), 'public', cleanPath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete example audio file:', e);
        }
      }
    }

    db.delete(examples).where(eq(examples.id, id)).run();

    return NextResponse.json({ success: true, message: 'Ayat contoh telah dipadam.' });
  } catch (error: any) {
    console.error('Error deleting example sentence:', error);
    return NextResponse.json({ error: 'Gagal memadam ayat contoh.' }, { status: 500 });
  }
}
