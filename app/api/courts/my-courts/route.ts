import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/pg";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(request as any);
    if (error) return error;

    if (user!.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { rows } = await pool.query(
      "SELECT * FROM courts WHERE owner_id = $1 ORDER BY created_at DESC",
      [user!.id]
    );

    return NextResponse.json({
      courts: rows.map((c: any) => ({
        ...c,
        price_per_hour: Number(c.price_per_hour),
        average_rating: Number(c.average_rating),
        total_ratings: Number(c.total_ratings),
        availability: c.availability
          ? typeof c.availability === 'string'
            ? JSON.parse(c.availability)
            : c.availability
          : null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Error al obtener canchas" },
      { status: 500 }
    );
  }
}
