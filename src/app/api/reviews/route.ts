import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/adapters/auth';
import { createReviewSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const body = await request.json();
    const parseResult = createReviewSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Missing required review fields.' }, { status: 400 });
    }

    const { bookingId, targetId, rating, comment, tags } = parseResult.data;

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

    // Dispatch notification to sitter for newly submitted review
    try {
      await db.notification.create({
        data: {
          userId: targetId,
          type: 'NEW_REVIEW',
          title: `★ New ${rating}-Star Review Received!`,
          content: `${session.user ? `${session.user.firstName} ${session.user.lastName}` : 'A parent'} left you a review: "${comment.slice(0, 80)}${comment.length > 80 ? '...' : ''}"`,
          bookingId,
          targetRoute: `/sitter/jobs`,
          actorName: session.user ? `${session.user.firstName} ${session.user.lastName}` : 'Parent',
          actorAvatar: session.user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        },
      });
    } catch (notifErr) {
      console.error('Non-blocking review notification error:', notifErr);
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review.' }, { status: 500 });
  }
}
