import { db } from '@/lib/db';
import { articles, uploadBatches, websites, activityLogs } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  const userId = Number.parseInt(session.user.id);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'upload');
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file locally
    await fs.writeFile(filePath, buffer);

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
        fileName: file.name,
        fileSize: file.size,
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
      message: `Uploaded batch: ${file.name} (${data.length} articles)`,
      userId: userId,
    });

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      url: `/upload/${fileName}`,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return new NextResponse('Failed to process file', { status: 500 });
  }
}
