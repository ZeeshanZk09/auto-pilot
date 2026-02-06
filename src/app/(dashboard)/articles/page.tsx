import { db } from '@/lib/db';
import { articles } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import { Globe, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PublishButton } from '@/components/articles/publish-button';

export default async function ArticlesPage() {
  const articleList = await db.query.articles.findMany({
    orderBy: [desc(articles.createdAt)],
    with: {
      website: true,
    },
  });

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Article Queue</h1>
        <p className='text-muted-foreground'>Manage and publish your spun articles to WordPress.</p>
      </div>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articleList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  No articles found. Upload an Excel file to get started.
                </TableCell>
              </TableRow>
            )}
            {articleList.map((article) => (
              <TableRow key={article.id}>
                <TableCell className='font-medium'>
                  {article.originalTitle}
                  {article.liveLink && (
                    <a
                      href={article.liveLink}
                      target='_blank'
                      className='ml-2 text-primary hover:underline inline-flex items-center gap-1'
                    >
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  {article.website ? (
                    <div className='flex items-center gap-2'>
                      <Globe className='h-4 w-4 text-muted-foreground' />
                      {article.website.name}
                    </div>
                  ) : (
                    <Badge variant='outline' className='text-amber-500 border-amber-500'>
                      <AlertCircle className='h-3 w-3 mr-1' /> No Website Match
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {article.status === 'published' && (
                    <Badge className='bg-emerald-500 hover:bg-emerald-600'>
                      <CheckCircle2 className='h-3 w-3 mr-1' /> Published
                    </Badge>
                  )}
                  {article.status === 'pending' && (
                    <Badge variant='secondary'>
                      <Clock className='h-3 w-3 mr-1' /> Pending
                    </Badge>
                  )}
                  {article.status === 'failed' && (
                    <Badge variant='destructive'>
                      <AlertCircle className='h-3 w-3 mr-1' /> Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {new Date(article.createdAt || '').toLocaleDateString()}
                </TableCell>
                <TableCell className='text-right'>
                  {article.status === 'pending' && article.websiteId && (
                    <PublishButton articleId={article.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
