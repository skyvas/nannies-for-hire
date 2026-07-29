import { db } from '@/lib/db';

export interface UserSessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PARENT' | 'SITTER' | 'ADMIN' | string;
}

export async function canUserAccessBooking(user: UserSessionUser | null, bookingId: string): Promise<boolean> {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      sitterProfile: true,
      household: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!booking) return false;

  // Check if user is the assigned sitter
  if (user.role === 'SITTER' && booking.sitterProfile?.userId === user.id) {
    return true;
  }

  // Check if user is a member of the household
  if (user.role === 'PARENT' && booking.household?.members.some((m) => m.userId === user.id)) {
    return true;
  }

  return false;
}

export async function canUserAccessHousehold(user: UserSessionUser | null, householdId: string): Promise<boolean> {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  const member = await db.householdMember.findUnique({
    where: {
      householdId_userId: {
        householdId,
        userId: user.id,
      },
    },
  });

  return Boolean(member);
}

export function assertAdminRole(user: UserSessionUser | null): boolean {
  return Boolean(user && user.role === 'ADMIN');
}
