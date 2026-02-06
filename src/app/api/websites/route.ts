import { db } from '@/lib/db';
import { websites, activityLogs } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    const data = await db.query.websites.findMany({
      where: eq(websites.userId, Number.parseInt(session.user.id)),
      orderBy: (websites, { desc }) => [desc(websites.createdAt)],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching websites:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { name, url, username, password } = await req.json();

  if (!name || !url || !username || !password) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  try {
    const [newWebsite] = await db
      .insert(websites)
      .values({
        name,
        url,
        username,
        appPassword: password, // In real app, encrypt this!
        userId: Number.parseInt(session.user.id),
        status: 'active',
      })
      .returning();

    await db.insert(activityLogs).values({
      type: 'website_add',
      message: `Added new website: ${name}`,
      userId: Number.parseInt(session.user.id),
    });

    return NextResponse.json(newWebsite);
  } catch (error) {
    console.error('Error adding website:', error);
    return new NextResponse('Error adding website', { status: 500 });
  }
}
