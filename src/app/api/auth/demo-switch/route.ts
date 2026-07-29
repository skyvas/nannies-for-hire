import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, user });
    
    // Set cookie for 30 days
    response.cookies.set('demo_user_id', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to switch demo user' }, { status: 500 });
  }
}
