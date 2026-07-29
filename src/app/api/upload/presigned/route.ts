import { NextResponse } from 'next/server';
import { storageAdapter } from '@/lib/adapters/storage';
import { z } from 'zod';

const presignedRequestSchema = z.object({
  fileName: z.string().min(1, 'FileName required'),
  mimeType: z.string().min(1, 'MimeType required'),
  folder: z.string().optional().default('docs'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = presignedRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parseResult.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const { fileName, mimeType, folder } = parseResult.data;
    const presignedData = await storageAdapter.getPresignedUploadUrl(fileName, mimeType, folder);

    return NextResponse.json(presignedData);
  } catch (error) {
    console.error('Failed to issue presigned upload URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
