import { NextRequest, NextResponse } from 'next/server';
import { readReservations, writeReservations, readCourts, initializeData } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';
import { Reservation } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { getDayOfWeekFromDate, isSlotWithinAvailability } from '@/lib/availability';

export async function GET(request: NextRequest) {
  try {
    await initializeData();
    const user = requireAuth(request);
    const reservations = readReservations();
    const courts = readCourts();

    const userReservations = reservations
      .filter(r => r.userId === user.id)
      .map(reservation => ({
        ...reservation,
        court: courts.find(c => c.id === reservation.courtId),
      }))
      .filter(r => r.court);

    return NextResponse.json({ reservations: userReservations });
  } catch (error: any) {
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    );
  }
}

const addOneHour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const newHour = hours + 1;
  if (newHour > 24) {
    throw new Error('El horario seleccionado supera el horario permitido.');
  }
  return `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export async function POST(request: NextRequest) {
  try {
    await initializeData();
    const user = requireAuth(request);

    if (!['player', 'owner'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Debes estar registrado como jugador o dueño para reservar.' },
        { status: 403 }
      );
    }

    const { courtId, date, startTime, paymentMethod, transferTiming } = await request.json();

    if (!courtId || !date || !startTime || !paymentMethod) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (paymentMethod === 'transferencia' && !transferTiming) {
      return NextResponse.json(
        { error: 'Debes indicar cuándo realizarás la transferencia.' },
        { status: 400 }
      );
    }

    const courts = readCourts();
    const court = courts.find(c => c.id === courtId);
    if (!court) {
      return NextResponse.json(
        { error: 'Cancha no encontrada' },
        { status: 404 }
      );
    }

    const dayOfWeek = getDayOfWeekFromDate(date);
    if (!isSlotWithinAvailability(court.availability, dayOfWeek, startTime)) {
      return NextResponse.json(
        { error: 'El horario seleccionado no está disponible para esta cancha.' },
        { status: 400 }
      );
    }

    let endTime: string;
    try {
      endTime = addOneHour(startTime);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || 'Horario inválido' },
        { status: 400 }
      );
    }

    const reservations = readReservations();
    const conflictingReservation = reservations.find(
      (reservation) =>
        reservation.courtId === courtId &&
        reservation.date === date &&
        reservation.startTime === startTime &&
        reservation.status !== 'cancelled'
    );

    if (conflictingReservation) {
      return NextResponse.json(
        { error: 'Ese turno ya fue reservado. Elige otro horario.' },
        { status: 409 }
      );
    }

    const totalPrice = court.pricePerHour;

    const newReservation: Reservation = {
      id: uuidv4(),
      courtId,
      userId: user.id,
      date,
      startTime,
      endTime,
      totalPrice,
      paymentMethod,
      transferTiming: paymentMethod === 'transferencia' ? transferTiming : undefined,
      status: 'completed', // Marcado como completado para permitir calificación inmediata
      createdAt: new Date().toISOString(),
    };

    reservations.push(newReservation);
    writeReservations(reservations);

    return NextResponse.json({
      message: 'Reserva creada exitosamente',
      reservation: newReservation,
    });
  } catch (error: any) {
    if (error.message === 'No autenticado') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear reserva' },
      { status: 500 }
    );
  }
}

