import { z } from 'zod';

export const getMessageQuerySchema = z.object({
  bookingId: z.string().min(1, 'Missing bookingId'),
});

export const chatAttachmentSchema = z.object({
  url: z.string().min(1),
  type: z.enum(['image', 'video']),
  name: z.string().optional(),
});

export const createMessageSchema = z
  .object({
    bookingId: z.string().min(1, 'bookingId is required'),
    content: z.string().optional(),
    imageUrl: z.string().nullable().optional(),
    attachments: z.array(chatAttachmentSchema).max(3, 'Maximum 3 files allowed per message').optional(),
  })
  .refine((data) => Boolean(data.content?.trim() || data.imageUrl || (data.attachments && data.attachments.length > 0)), {
    message: 'Message content or attachment required',
  });

export const createBookingRequestSchema = z.object({
  sitterProfileId: z.string().min(1, 'Missing required booking fields.'),
  householdId: z.string().optional(),
  startDateTime: z.string().min(1, 'Missing required booking fields.'),
  endDateTime: z.string().min(1, 'Missing required booking fields.'),
  numChildren: z.number().int().positive().optional(),
  durationHours: z.number().positive().optional(),
});

export const updateBookingStatusSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE', 'START_SITTING', 'END_SITTING'], {
    message: 'Invalid action.',
  }),
});

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Missing required review fields.'),
  targetId: z.string().min(1, 'Missing required review fields.'),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(1, 'Missing required review fields.'),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
});

export const createChildSchema = z.object({
  householdId: z.string().min(1, 'Missing required child profile fields.'),
  firstName: z.string().min(1, 'Missing required child profile fields.'),
  birthDate: z.string().min(1, 'Missing required child profile fields.'),
  gender: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
  bedtimeRoutine: z.string().nullable().optional(),
});

export const updateSitterProfileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  baseHourlyRate: z.coerce.number(),
  extraChildRate: z.coerce.number().optional(),
  yearsExperience: z.coerce.number().optional(),
  cprCertified: z.boolean().optional(),
  hasVehicle: z.boolean().optional(),
  languages: z.string().optional(),
});

export const vettingActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT'], {
    message: 'Invalid action.',
  }),
});
