import { NextRequest, NextResponse } from 'next/server';
import { readCourts, writeCourts, initializeData } from '@/lib/db';
import { requireRole } from '@/lib/api-helpers';
import { Court, CourtAvailability } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { validateAvailability } from '@/lib/availability';

export async function POST(request: NextRequest) {
  try {
    await initializeData();
    const user = requireRole(request, ['owner']);

    const { name, sport, location, pricePerHour, description, availability } = await request.json();

    if (!name || !sport || !location || !pricePerHour || !description || !availability) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (!validateAvailability(availability as CourtAvailability[])) {
      return NextResponse.json(
        { error: 'La disponibilidad enviada no es válida.' },
        { status: 400 }
      );
    }

    // Verificar cuántas canchas tiene el dueño
    const courts = readCourts();
    const ownerCourts = courts.filter(c => c.ownerId === user.id);

    if (ownerCourts.length >= 1) {
      return NextResponse.json(
        { error: 'Ya tienes una cancha. Para agregar más, debes solicitar permiso al administrador.' },
        { status: 403 }
      );
    }

    const newCourt: Court = {
      id: uuidv4(),
      name,
      sport,
      location,
      pricePerHour: Number(pricePerHour),
      ownerId: user.id,
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


