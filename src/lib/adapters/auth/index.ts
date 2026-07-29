import { cookies } from 'next/headers';
import { db } from '../../db';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'PARENT' | 'SITTER' | 'ADMIN';
    avatarUrl?: string | null;
  } | null;
}

export async function getCurrentSession(): Promise<AuthSession> {
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get('demo_user_id')?.value;

  if (!demoUserId) {
    // Default to the primary demo parent if no cookie is set yet
    const defaultParent = await db.user.findFirst({
      where: { role: 'PARENT' },
    });

    if (defaultParent) {
      return {
        user: {
          id: defaultParent.id,
          email: defaultParent.email,
          firstName: defaultParent.firstName,
          lastName: defaultParent.lastName,
          role: defaultParent.role as 'PARENT' | 'SITTER' | 'ADMIN',
          avatarUrl: defaultParent.avatarUrl,
        },
      };
    }

    return { user: null };
  }

  const user = await db.user.findUnique({
    where: { id: demoUserId },
  });

  if (!user) {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as 'PARENT' | 'SITTER' | 'ADMIN',
      avatarUrl: user.avatarUrl,
    },
  };
}
