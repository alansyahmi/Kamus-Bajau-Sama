import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth/adminAuth';
import { db } from '@/lib/db';
import { categories, entryCategories } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const allCats = await db.select().from(categories).orderBy(categories.nameMs).all();

    // Include item count per category
    const counts = await db
      .select({
        categoryId: entryCategories.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(entryCategories)
      .groupBy(entryCategories.categoryId)
      .all();

    const countMap = new Map<number, number>();
    for (const c of counts) {
      countMap.set(c.categoryId, c.count);
    }

    const categoriesWithCount = allCats.map(cat => ({
      ...cat,
      count: countMap.get(cat.id) || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json({ error: 'Gagal memuatkan senarai kategori.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { nameMs, nameEn, slug: rawSlug, description, icon } = body;

    if (!nameMs?.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
    }

    let slug = (rawSlug || nameMs)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) slug = `kategori-${Date.now()}`;

    // Check if slug exists
    const existing = db.select().from(categories).where(eq(categories.slug, slug)).get();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newCategory = db.insert(categories).values({
      nameMs: nameMs.trim(),
      nameEn: nameEn?.trim() || null,
      slug,
      description: description?.trim() || null,
      icon: icon?.trim() || '🏷️',
    }).returning().get();

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error?.message || 'Gagal mencipta kategori baharu.' }, { status: 500 });
  }
}
