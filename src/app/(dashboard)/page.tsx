import { db } from '@/lib/db';
import { articles, websites, activityLogs } from '@/lib/schema';
import { count, eq, inArray, and } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Globe, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { auth } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  const userId = Number.parseInt(session.user.id);

  const result = await (async () => {
    try {
      // Stats
      const userWebsites = await db.query.websites.findMany({
        where: eq(websites.userId, userId),
        columns: { id: true },
      });
      const websiteIds = userWebsites.map((w) => w.id);

      const [totalArticlesCount] =
        websiteIds.length > 0
          ? await db
              .select({ value: count() })
              .from(articles)
              .where(inArray(articles.websiteId, websiteIds))
          : [{ value: 0 }];

      const [publishedArticlesCount] =
        websiteIds.length > 0
          ? await db
              .select({ value: count() })
              .from(articles)
              .where(and(inArray(articles.websiteId, websiteIds), eq(articles.status, 'published')))
          : [{ value: 0 }];

      const [pendingArticlesCount] =
        websiteIds.length > 0
          ? await db
              .select({ value: count() })
              .from(articles)
              .where(and(inArray(articles.websiteId, websiteIds), eq(articles.status, 'pending')))
          : [{ value: 0 }];

      const [websitesCount] = await db
        .select({ value: count() })
        .from(websites)
        .where(eq(websites.userId, userId));

      // Recent Activity
      const recentActivity = await db.query.activityLogs.findMany({
        where: eq(activityLogs.userId, userId),
        orderBy: (activityLogs, { desc }) => [desc(activityLogs.createdAt)],
        limit: 5,
      });

      // Recent Live Links
      const liveLinks = await db.query.articles.findMany({
        where: eq(articles.status, 'published'),
        orderBy: (articles, { desc }) => [desc(articles.publishedAt)],
        limit: 5,
        with: {
          website: true,
        },
      });

      return {
        totalArticlesCount: totalArticlesCount.value,
        publishedArticlesCount: publishedArticlesCount.value,
        pendingArticlesCount: pendingArticlesCount.value,
        websitesCount: websitesCount.value,
        recentActivity,
        liveLinks,
        error: false,
      };
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      return { error: true };
    }
  })();

  if (result.error || !result.liveLinks) {
    return (
      <div className='p-8 text-center'>
        <h2 className='text-2xl font-bold text-destructive'>Error loading dashboard</h2>
        <p className='text-muted-foreground mt-2'>Please check your database connection.</p>
      </div>
    );
  }

  const {
    totalArticlesCount,
    publishedArticlesCount,
    pendingArticlesCount,
    websitesCount,
    recentActivity,
    liveLinks,
  } = result;

  const stats = [
    {
      title: 'Total Articles',
      value: totalArticlesCount,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Published',
      value: publishedArticlesCount,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Pending',
      value: pendingArticlesCount,
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      title: 'Active Websites',
      value: websitesCount,
      icon: Globe,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Overview</h2>
        <p className='text-muted-foreground'>Monitor your PBN automation status and performance.</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <stat.icon size={16} className={stat.color} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='md:col-span-4 transition-all'>
          <CardHeader>
            <CardTitle>Recent Live Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {liveLinks.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>
                  No links published yet.
                </p>
              ) : (
                liveLinks.map((link) => (
                  <div
                    key={link.id}
                    className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='space-y-1 overflow-hidden'>
                      <p className='text-sm font-medium truncate'>
                        {link.spunTitle || link.originalTitle}
                      </p>
                      <p className='text-xs text-muted-foreground'>{link.website?.url}</p>
                    </div>
                    <a
                      href={link.liveLink || '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='ml-4 p-2 rounded-full hover:bg-primary/10 text-primary transition-colors'
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='md:col-span-3'>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentActivity.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>
                  No recent activity found.
                </p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className='flex gap-4 border-l-2 border-primary pl-4 py-1'>
                    <div className='flex-1 space-y-1'>
                      <p className='text-sm'>{log.message}</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDistanceToNow(log.createdAt || new Date(), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
