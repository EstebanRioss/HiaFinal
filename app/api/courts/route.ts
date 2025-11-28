import { NextResponse } from "next/server";
import { query } from "@/lib/pg";

export async function GET() {
  try {
    const { rows } = await query("SELECT * FROM courts ORDER BY created_at DESC");
    const courts = rows.map((c: any) => ({
      ...c,
      price_per_hour: Number(c.price_per_hour),
      average_rating: c.average_rating !== null && c.average_rating !== undefined ? Number(c.average_rating) : 0,
      total_ratings: c.total_ratings !== null && c.total_ratings !== undefined ? Number(c.total_ratings) : 0,
      availability: c.availability
        ? typeof c.availability === 'string'
          ? JSON.parse(c.availability)
          : c.availability
        : [],
    }));

    return NextResponse.json({ courts });
  } catch (err: any) {
    console.error('Error fetching courts:', err.message ?? err);
    return NextResponse.json({ error: 'Error fetching courts' }, { status: 500 });
  }
}
