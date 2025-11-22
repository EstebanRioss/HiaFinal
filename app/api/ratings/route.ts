import { NextRequest, NextResponse } from 'next/server';
import { readRatings, writeRatings, readCourts, writeCourts, readReservations, initializeData } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';
import { Rating } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await initializeData();
    const user = requireAuth(request);

    const { courtId, reservationId, rating, comment } = await request.json();

    if (!courtId || !reservationId || !rating) {
      return NextResponse.json(
        { error: 'Cancha, reserva y puntuación son requeridos' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La puntuación debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    // Verificar que la reserva pertenece al usuario y está completada
    const reservations = readReservations();
    const reservation = reservations.find(r => r.id === reservationId && r.userId === user.id);
    if (!reservation || reservation.status !== 'completed') {
      return NextResponse.json(
        { error: 'Reserva no encontrada o no completada' },
        { status: 400 }
      );
    }

    // Verificar que no haya calificado antes
    const ratings = readRatings();
    if (ratings.find(r => r.reservationId === reservationId)) {
      return NextResponse.json(
        { error: 'Ya calificaste esta reserva' },
        { status: 400 }
      );
    }

    const newRating: Rating = {
      id: uuidv4(),
      courtId,
      userId: user.id,
      reservationId,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString(),
    };

    ratings.push(newRating);
    writeRatings(ratings);

    // Actualizar promedio de la cancha
    const courts = readCourts();
    const court = courts.find(c => c.id === courtId);
    if (court) {
      const courtRatings = ratings.filter(r => r.courtId === courtId);
      const totalRating = courtRatings.reduce((sum, r) => sum + r.rating, 0);
      court.averageRating = totalRating / courtRatings.length;
      court.totalRatings = courtRatings.length;
      writeCourts(courts);
    }

    return NextResponse.json({
      message: 'Calificación enviada exitosamente',
      rating: newRating,
    });
  } catch (error: any) {
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al enviar calificación' },
      { status: 500 }
    );
  }
}

