import { NextRequest, NextResponse } from 'next/server';
import { readCourtRequests, writeCourtRequests, readCourts, initializeData } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/api-helpers';
import { CourtRequest, Court, CourtAvailability } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { validateAvailability } from '@/lib/availability';

// Obtener solicitudes (admin ve todas, dueño ve solo las suyas)
export async function GET(request: NextRequest) {
  try {
    await initializeData();
    const user = requireAuth(request);
    const requests = readCourtRequests();

    if (user.role === 'admin') {
      return NextResponse.json({ requests });
    } else {
      const ownerRequests = requests.filter(r => r.ownerId === user.id);
      return NextResponse.json({ requests: ownerRequests });
    }
  } catch (error: any) {
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}

// Crear solicitud (solo dueños)
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
        { error: 'Debes enviar una disponibilidad válida.' },
        { status: 400 }
      );
    }

    // Verificar que el dueño ya tenga al menos una cancha
    const courts = readCourts();
    const ownerCourts = courts.filter(c => c.ownerId === user.id);

    if (ownerCourts.length < 1) {
      return NextResponse.json(
        { error: 'Primero debes agregar tu primera cancha directamente desde el panel de dueño.' },
        { status: 400 }
      );
    }

    const requests = readCourtRequests();
    const newRequest: CourtRequest = {
      id: uuidv4(),
      ownerId: user.id,
      name,
      sport,
      location,
      pricePerHour: Number(pricePerHour),
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      availability,
    };

    requests.push(newRequest);
    writeCourtRequests(requests);

    return NextResponse.json({
      message: 'Solicitud enviada exitosamente. El administrador la revisará pronto.',
      request: newRequest,
    });
  } catch (error: any) {
    if (error.message === 'No autenticado' || error.message === 'No autorizado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear solicitud' },
      { status: 500 }
    );
  }
}


