import { db } from '@/lib/db';
import { articles, uploadBatches, websites, activityLogs } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = Number.parseInt(session.user.id);

  try {
    const { url, name, size } = await req.json();

    // 1. Download file
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2. Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: { Title?: string; Content?: string; Keywords?: string; Website?: string }[] =
      XLSX.utils.sheet_to_json(worksheet);

    // 3. Get user's websites for matching
    const userWebsites = await db.query.websites.findMany({
      where: eq(websites.userId, userId),
    });

    // 4. Create Batch
    const [batch] = await db
      .insert(uploadBatches)
      .values({
        fileName: name,
        fileSize: size,
        totalArticles: data.length,
        userId: userId,
        status: 'completed',
      })
      .returning();

    // 5. Create Article Entries
    const articleEntries = data.map((row) => {
      // Find website by name or URL
      const website = userWebsites.find(
        (ws) =>
          ws.name.toLowerCase() === (row.Website?.toString() || '').toLowerCase() ||
          ws.url.toLowerCase().includes((row.Website?.toString() || '').toLowerCase())
      );

      return {
        originalTitle: row.Title?.toString() || 'Untitled',
        originalContent: row.Content?.toString() || '',
        keywords: row.Keywords?.toString() || '',
        websiteId: website?.id || null,
        batchId: batch.id,
        status: 'pending',
      };
    });

    if (articleEntries.length > 0) {
      await db.insert(articles).values(articleEntries);
    }

    await db.insert(activityLogs).values({
      type: 'upload',
      message: `Uploaded batch: ${name} (${data.length} articles)`,
      userId: userId,
    });

    return NextResponse.json({ success: true, batchId: batch.id });
  } catch (error) {
    console.error('Excel processing error:', error);
    return new NextResponse('Failed to process file', { status: 500 });
  }
}
