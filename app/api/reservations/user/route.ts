import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  const { rows } = await query(
    `SELECT r.*, c.name AS court_name
     FROM reservations r
     JOIN courts c ON c.id = r.court_id
     WHERE r.user_id = $1
     ORDER BY r.date DESC`,
    [user!.id]
  );

  return NextResponse.json({ reservations: rows });
}
