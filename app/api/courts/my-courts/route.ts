import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/pg";
import { requireRole } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const user: any = requireRole(request as any, ["owner"] as any);

    const { rows } = await pool.query(
      "SELECT * FROM courts WHERE owner_id = $1 ORDER BY created_at DESC",
      [user.id]
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
