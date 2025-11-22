import { NextRequest, NextResponse } from 'next/server';
import { readCourts, writeCourts, initializeData } from '@/lib/db';
import { requireRole } from '@/lib/api-helpers';
import { Court, CourtAvailability } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { validateAvailability } from '@/lib/availability';

export async function GET() {
  try {
    await initializeData();
    const courts = readCourts();
    return NextResponse.json({ courts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener canchas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeData();
    requireRole(request, ['admin']);

    const { name, sport, location, pricePerHour, description, ownerId, availability } = await request.json();

    if (!name || !sport || !location || !pricePerHour || !description || !ownerId || !availability) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (!validateAvailability(availability as CourtAvailability[])) {
      return NextResponse.json(
        { error: 'Debes definir una disponibilidad válida.' },
        { status: 400 }
      );
    }

    const courts = readCourts();
    const newCourt: Court = {
      id: uuidv4(),
      name,
      sport,
      location,
      pricePerHour: Number(pricePerHour),
      ownerId,
      description,
      averageRating: 0,
      totalRatings: 0,
      createdAt: new Date().toISOString(),
      availability,
    };

    courts.push(newCourt);
    writeCourts(courts);

    return NextResponse.json({
      message: 'Cancha creada exitosamente',
      court: newCourt,
    });
  } catch (error: any) {
    if (error.message === 'No autenticado' || error.message === 'No autorizado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear cancha' },
      { status: 500 }
    );
  }
}

