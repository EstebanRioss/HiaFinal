import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/pg";

export async function GET(req: NextRequest, { params }: any) {
  const { id } = params;

  const { rows } = await query("SELECT * FROM courts WHERE id = $1", [id]);
  if (!rows.length) return NextResponse.json({ error: "Court not found" }, { status: 404 });
  const c = rows[0];
  const court = {
    ...c,
    price_per_hour: Number(c.price_per_hour),
    average_rating: Number(c.average_rating),
    total_ratings: Number(c.total_ratings),
    availability: c.availability
      ? typeof c.availability === 'string'
        ? JSON.parse(c.availability)
        : c.availability
      : [],
  };

  return NextResponse.json({ court });
}
