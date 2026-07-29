import { db } from '@/lib/db';

export interface CreateNotificationParams {
  userId: string;
  type:
    | 'NEW_BOOKING_REQUEST'
    | 'BOOKING_ACCEPTED'
    | 'BOOKING_DECLINED'
    | 'CHAT_MESSAGE'
    | 'NEW_NANNY_APPLICATION'
    | 'BOOKING_CLOCK_UPDATE'
    | 'REVIEW_SUBMITTED'
    | string;
  title: string;
  content: string;
  bookingId?: string | null;
  targetRoute?: string | null;
  actorName?: string | null;
  actorAvatar?: string | null;
  metadata?: Record<string, any> | null;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        bookingId: params.bookingId || null,
        targetRoute: params.targetRoute || null,
        actorName: params.actorName || null,
        actorAvatar: params.actorAvatar || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
