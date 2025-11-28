import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/pg";
import { generateHourlySlots, getDayOfWeekFromDate } from "@/lib/availability";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date)
      return NextResponse.json(
        { error: "Debes enviar date (YYYY-MM-DD)" },
        { status: 400 }
      );

    const resCourt = await pool.query("SELECT * FROM courts WHERE id=$1", [
      params.id,
    ]);
    const court = resCourt.rows[0];

    if (!court)
      return NextResponse.json({ error: "Cancha no encontrada" }, { status: 404 });

    // Ensure availability is parsed as JSON
    const availability = court.availability
      ? typeof court.availability === 'string'
        ? JSON.parse(court.availability)
        : court.availability
      : [];

    const dayOfWeek = getDayOfWeekFromDate(date);

    const allSlots = generateHourlySlots(availability, dayOfWeek);

    const resReservations = await pool.query(
      `
      SELECT start_time 
      FROM reservations 
      WHERE court_id=$1 AND date=$2 AND status != 'cancelled'
    `,
      [params.id, date]
    );

    const taken = resReservations.rows.map((r) => r.start_time);

    const available = allSlots.filter((slot) => !taken.includes(slot));

    return NextResponse.json({ slots: available });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener los turnos disponibles" },
      { status: 500 }
    );
  }
}
