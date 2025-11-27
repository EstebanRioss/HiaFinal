import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { courtId, reservationId, rating, comment } = await req.json();

  const alreadyRated = await query(
    "SELECT id FROM ratings WHERE user_id = $1 AND reservation_id = $2",
    [user!.id, reservationId]
  );

  if (alreadyRated.rowCount > 0)
    return NextResponse.json({ error: "Already rated" }, { status: 400 });

  const id = crypto.randomUUID();

  await query(
    `INSERT INTO ratings (id, court_id, user_id, reservation_id, rating, comment, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
    [id, courtId, user!.id, reservationId, rating, comment]
  );

  return NextResponse.json({ success: true });
}
