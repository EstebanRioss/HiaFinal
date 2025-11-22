import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-helpers';
import { getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    const user = getUserById(authUser.id);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}


