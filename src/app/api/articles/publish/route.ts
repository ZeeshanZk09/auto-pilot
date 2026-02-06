import { db } from '@/lib/db';
import { articles, activityLogs } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { spinText, formatForWordPress } from '@/lib/spinning';
import { publishToWordPress } from '@/lib/wordpress';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = Number.parseInt(session.user.id);

  try {
    const { articleId } = await req.json();

    // 1. Get Article and Website
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
      with: {
        website: true,
      },
    });

    if (!article?.website || article?.website?.userId !== userId) {
      return new NextResponse('Article or Website not found', { status: 404 });
    }

    if (article.status === 'published') {
      return new NextResponse('Already published', { status: 400 });
    }

    // 2. Spin Content
    const spunTitle = spinText(article.originalTitle);
    const spunBody = spinText(article.originalContent);
    const htmlContent = formatForWordPress(spunTitle, spunBody, article.keywords || '');

    // 3. Publish to WordPress
    const wpResult = await publishToWordPress(
      {
        url: article.website.url,
        username: article.website.username,
        appPassword: article.website.appPassword,
      },
      {
        title: spunTitle,
        content: htmlContent,
        status: 'publish',
      }
    );

    if (wpResult.success) {
      // 4. Update Database
      await db
        .update(articles)
        .set({
          spunTitle,
          spunContent: spunBody,
          status: 'published',
          liveLink: wpResult.link,
          publishedAt: new Date(),
        })
        .where(eq(articles.id, articleId));

      await db.insert(activityLogs).values({
        type: 'publish',
        message: `Successfully published: ${spunTitle} to ${article.website.name}`,
        userId: userId,
      });

      return NextResponse.json({ success: true, link: wpResult.link });
    } else {
      await db.update(articles).set({ status: 'failed' }).where(eq(articles.id, articleId));

      return NextResponse.json({ success: false, error: wpResult.error }, { status: 500 });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Publishing error:', err);
    return new NextResponse(err.message || 'Internal Server Error', { status: 500 });
  }
}
