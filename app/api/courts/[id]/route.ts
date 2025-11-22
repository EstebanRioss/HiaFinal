import { NextRequest, NextResponse } from 'next/server';
import { readCourts, initializeData } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeData();
    const courts = readCourts();
    const court = courts.find(c => c.id === params.id);

    if (!court) {
      return NextResponse.json(
        { error: 'Cancha no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ court });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener cancha' },
      { status: 500 }
    );
  }
}

