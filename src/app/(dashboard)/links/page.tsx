import { db } from '@/lib/db';
import { articles } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { Globe, ExternalLink, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function LiveLinksPage() {
  const publishedArticles = await db.query.articles.findMany({
    where: eq(articles.status, 'published'),
    orderBy: [desc(articles.publishedAt)],
    with: {
      website: true,
    },
  });

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
