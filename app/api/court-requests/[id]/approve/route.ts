import { NextRequest, NextResponse } from 'next/server';
import { readCourtRequests, writeCourtRequests, readCourts, writeCourts, initializeData } from '@/lib/db';
import { requireRole } from '@/lib/api-helpers';
import { Court } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeData();
    const admin = requireRole(request, ['admin']);

    const requests = readCourtRequests();
    const courtRequest = requests.find(r => r.id === params.id);

    if (!courtRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    if (courtRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta solicitud ya fue procesada' },
        { status: 400 }
      );
    }

    // Crear la cancha
    const courts = readCourts();
    const newCourt: Court = {
      id: uuidv4(),
      name: courtRequest.name,
      sport: courtRequest.sport,
      location: courtRequest.location,
      pricePerHour: courtRequest.pricePerHour,
      ownerId: courtRequest.ownerId,
      description: courtRequest.description,
      averageRating: 0,
      totalRatings: 0,
      createdAt: new Date().toISOString(),
      availability: courtRequest.availability,
    };

    courts.push(newCourt);
    writeCourts(courts);

    // Actualizar el estado de la solicitud
    courtRequest.status = 'approved';
    courtRequest.reviewedAt = new Date().toISOString();
    courtRequest.reviewedBy = admin.id;
    writeCourtRequests(requests);

    return NextResponse.json({
      message: 'Solicitud aprobada y cancha creada exitosamente',
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
      { error: 'Error al aprobar solicitud' },
      { status: 500 }
    );
  }
}


