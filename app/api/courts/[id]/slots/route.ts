import { NextRequest, NextResponse } from 'next/server';
import { readCourts, readReservations, initializeData } from '@/lib/db';
import { generateHourlySlots, getDayOfWeekFromDate } from '@/lib/availability';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await initializeData();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Debes enviar el parámetro date (YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    const courts = readCourts();
    const court = courts.find((c) => c.id === params.id);

    if (!court) {
      return NextResponse.json(
        { error: 'Cancha no encontrada' },
        { status: 404 }
      );
    }

    const dayOfWeek = getDayOfWeekFromDate(date);
    const allSlots = generateHourlySlots(court.availability, dayOfWeek);

    const reservations = readReservations();
    const takenSlots = reservations
      .filter((reservation) => reservation.courtId === params.id && reservation.date === date && reservation.status !== 'cancelled')
      .map((reservation) => reservation.startTime);

    const availableSlots = allSlots.filter((slot) => !takenSlots.includes(slot));

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los turnos disponibles' },
      { status: 500 }
    );
  }
}

