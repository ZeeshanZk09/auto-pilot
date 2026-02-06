import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { testWPConnection } from '@/lib/wordpress';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const { url, username, password } = await req.json();

    const result = await testWPConnection({
      url,
      username,
      appPassword: password,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return new NextResponse(result.error, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('WP Test error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
