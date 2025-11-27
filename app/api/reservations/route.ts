import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { courtId, date, startTime, endTime, totalPrice, paymentMethod, transferTiming } =
    await req.json();

  const conflict = await query(
    `SELECT id FROM reservations
     WHERE court_id = $1 AND date = $2
     AND (start_time, end_time) OVERLAPS ($3, $4)`,
    [courtId, date, startTime, endTime]
  );

  if (conflict.rowCount > 0)
    return NextResponse.json({ error: "Time slot already reserved" }, { status: 400 });

  const id = crypto.randomUUID();

  await query(
    `INSERT INTO reservations
     (id, court_id, user_id, date, start_time, end_time, total_price, payment_method, transfer_timing, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'completed',NOW())`,
    [id, courtId, user!.id, date, startTime, endTime, totalPrice, paymentMethod, transferTiming]
  );

  return NextResponse.json({ success: true });
}
