import { NextRequest, NextResponse } from 'next/server';
import { readUsers, initializeData } from '@/lib/db';
import { requireRole } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    await initializeData();
    requireRole(request, ['admin']);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let users = readUsers();
    if (role) {
      users = users.filter(u => u.role === role);
    }

    // No devolver las contraseñas
    const safeUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    if (error.message === 'No autenticado' || error.message === 'No autorizado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

