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

export const nannyApplicationDocumentSchema = z.object({
  documentType: z.enum([
    'GOVT_ID',
    'RESUME',
    'CPR_CERT',
    'FIRST_AID_CERT',
    'BACKGROUND_CHECK_AUTH',
    'DRIVERS_LICENSE',
    'AUTO_INSURANCE',
    'REFERENCES',
    'PROOF_OF_ADDRESS',
    'PROFESSIONAL_CERTS',
    'VACCINATION_RECORDS',
  ]),
  fileName: z.string().min(1, 'Filename required'),
  storagePath: z.string().min(1, 'Storage path required'),
  fileSize: z.number().nonnegative(),
  mimeType: z.string().min(1, 'Mime type required'),
});

export const createNannyApplicationSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().default('BC'),
  postalCode: z.string().min(3, 'Postal Code is required'),
  emergencyContact: z.string().min(1, 'Emergency Contact name is required'),
  emergencyPhone: z.string().min(7, 'Emergency Contact phone is required'),

  // Professional Information
  yearsExperience: z.coerce.number().min(0),
  childcareTypes: z.union([z.array(z.string()), z.string()]),
  infantExp: z.boolean().default(false),
  toddlerExp: z.boolean().default(false),
  specialNeedsExp: z.boolean().default(false),
  languages: z.string().min(1, 'Languages spoken are required'),
  education: z.string().min(1, 'Education background is required'),
  certifications: z.string().optional(),
  availability: z.string().min(1, 'Availability is required'),
  preferredSchedule: z.string().optional(),
  willingToTravel: z.boolean().default(false),
  driverLicenseStatus: z.string().min(1, 'Driver license status required'),
  ownVehicle: z.boolean().default(false),
  cprCertified: z.boolean().default(false),
  firstAidCertified: z.boolean().default(false),

  // Agreements
  agreementsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and agreements',
  }),
  electronicSignature: z.string().min(1, 'Electronic signature is required'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),

  // Documents
  documents: z.array(nannyApplicationDocumentSchema).min(1, 'At least one document is required'),
});

export const updateNannyApplicationStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'DOCUMENTS_REQUESTED',
    'INTERVIEW_SCHEDULED',
    'BACKGROUND_CHECK',
    'APPROVED',
    'REJECTED',
    'ARCHIVED',
  ]),
  notes: z.string().optional(),
});
