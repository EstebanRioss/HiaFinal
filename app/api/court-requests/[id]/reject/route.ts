import { NextRequest, NextResponse } from 'next/server';
import { readCourtRequests, writeCourtRequests, initializeData } from '@/lib/db';
import { requireRole } from '@/lib/api-helpers';

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

    // Actualizar el estado de la solicitud
    courtRequest.status = 'rejected';
    courtRequest.reviewedAt = new Date().toISOString();
    courtRequest.reviewedBy = admin.id;
    writeCourtRequests(requests);

    return NextResponse.json({
      message: 'Solicitud rechazada',
    });
  } catch (error: any) {
    if (error.message === 'No autenticado' || error.message === 'No autorizado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al rechazar solicitud' },
      { status: 500 }
    );
  }
}


