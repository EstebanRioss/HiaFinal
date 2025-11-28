import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req);
  if (error) return error;

  if (user!.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { rows } = await query("SELECT * FROM courts WHERE owner_id = $1", [user!.id]);
  return NextResponse.json({ courts: rows.map((c: any) => ({
    ...c,
    price_per_hour: Number(c.price_per_hour),
    average_rating: Number(c.average_rating),
    total_ratings: Number(c.total_ratings),
    availability: c.availability
      ? typeof c.availability === 'string'
        ? JSON.parse(c.availability)
        : c.availability
      : null,
  })) });
}
