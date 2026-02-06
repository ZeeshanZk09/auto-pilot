import { db } from '@/lib/db';
import { websites } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const websiteId = Number.parseInt(id);

  try {
    await db
      .delete(websites)
      .where(
        and(eq(websites.id, websiteId), eq(websites.userId, Number.parseInt(session.user.id)))
      );

    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting website:', error);
    return new NextResponse('Error deleting website', { status: 500 });
  }
}
