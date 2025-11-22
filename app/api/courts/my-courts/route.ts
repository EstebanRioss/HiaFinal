import { NextRequest, NextResponse } from 'next/server';
import { readCourts, initializeData } from '@/lib/db';
import { requireRole } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    await initializeData();
    const user = requireRole(request, ['owner']);

    const courts = readCourts();
    const ownerCourts = courts.filter(c => c.ownerId === user.id);

    return NextResponse.json({ courts: ownerCourts });
  } catch (error: any) {
    if (error.message === 'No autenticado' || error.message === 'No autorizado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al obtener canchas' },
      { status: 500 }
    );
  }
}


