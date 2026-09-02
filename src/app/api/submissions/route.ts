import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { z } from 'zod';

export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'edge';

const submissionSchema = z.object({
  headword: z.string().min(1).max(100),
  meaning: z.string().min(1).max(500),
  exampleSentence: z.string().max(1000).optional(),
  locality: z.string().max(100).optional(),
  contributorName: z.string().max(100).optional(),
  contributorEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = submissionSchema.parse(json);

    const result = await db.insert(submissions).values({
      headword: parsed.headword,
      meaning: parsed.meaning,
      exampleSentence: parsed.exampleSentence || null,
      locality: parsed.locality || 'Kota Belud',
      contributorName: parsed.contributorName || null,
      contributorEmail: parsed.contributorEmail || null,
      notes: parsed.notes || null,
      status: 'pending',
    });

    return NextResponse.json({ success: true, message: 'Submission received successfully' }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    console.error('Submission API error:', err);
    return NextResponse.json({ error: 'Failed to record submission' }, { status: 500 });
  }
}
