import { db } from '@/lib/db';
import { articles, websites } from '@/lib/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { Globe, ExternalLink, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LiveLinksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = Number.parseInt(session.user.id);

  const result = await (async () => {
    try {
      // Get user's website IDs to filter articles
      const userWebsites = await db.query.websites.findMany({
        where: eq(websites.userId, userId),
        columns: { id: true },
      });

      const websiteIds = userWebsites.map((w) => w.id);

      const items =
        websiteIds.length > 0
          ? await db.query.articles.findMany({
              where: and(eq(articles.status, 'published'), inArray(articles.websiteId, websiteIds)),
              orderBy: [desc(articles.publishedAt)],
              with: {
                website: true,
              },
            })
          : [];
      return { items, error: false };
    } catch (error) {
      console.error('Failed to fetch live links:', error);
      return { items: [], error: true };
    }
  })();

  if (result.error) {
    return (
      <div className='p-8 text-center'>
        <h2 className='text-2xl font-bold text-destructive'>Error loading live links</h2>
        <p className='text-muted-foreground mt-2'>Please try again later.</p>
      </div>
    );
  }

  const publishedArticles = result.items;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Live Links</h1>
        <p className='text-muted-foreground'>
          List of all successfully published articles with their live URLs.
        </p>
      </div>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Spun Title</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className='text-right'>Live Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishedArticles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  No live links yet. Publish some articles from the queue.
                </TableCell>
              </TableRow>
            )}
            {publishedArticles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className='font-medium'>{article.spunTitle}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Globe className='h-4 w-4 text-muted-foreground' />
                    {article.website?.name}
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-3 w-3' />
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <a
                    href={article.liveLink || '#'}
                    target='_blank'
                    className='inline-flex items-center gap-2 text-primary hover:underline font-medium'
                  >
                    View Post <ExternalLink className='h-4 w-4' />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
