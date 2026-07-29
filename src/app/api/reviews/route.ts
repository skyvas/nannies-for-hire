import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getCurrentSession } from '../../../lib/adapters/auth';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const { bookingId, targetId, rating, comment, tags } = await request.json();

    if (!bookingId || !targetId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required review fields.' }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        bookingId,
        authorId: session.user?.id || 'demo_author_id',
        targetId,
        rating: Number(rating),
        comment,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
      },
    });

    // Update sitter average rating
    const sitterReviews = await db.review.findMany({
      where: { targetId },
    });

    const avg = sitterReviews.reduce((sum, r) => sum + r.rating, 0) / sitterReviews.length;

    await db.sitterProfile.updateMany({
      where: { userId: targetId },
      data: {
        averageRating: Math.round(avg * 10) / 10,
        totalReviews: sitterReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review.' }, { status: 500 });
  }
}
