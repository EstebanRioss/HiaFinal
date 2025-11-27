import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/pg";
import { requireRole } from "@/lib/api-helpers";
import { v4 as uuid } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin: any = requireRole(request, ["admin"] as any);

    const { rows } = await pool.query(
      "SELECT * FROM court_requests WHERE id=$1 LIMIT 1",
      [params.id]
    );

    const req = rows[0];

    if (!req)
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );

    if (req.status !== "pending")
      return NextResponse.json(
        { error: "La solicitud ya fue procesada" },
        { status: 400 }
      );

    const courtId = uuid();

    const availability = req.availability
      ? typeof req.availability === 'string'
        ? JSON.parse(req.availability)
        : req.availability
      : null;

    await pool.query(
      `
      INSERT INTO courts
      (id,name,sport,location,price_per_hour,owner_id,description,average_rating,total_ratings,created_at,availability)
      VALUES ($1,$2,$3,$4,$5,$6,$7,0,0,NOW(),$8)
    `,
      [
        courtId,
        req.name,
        req.sport,
        req.location,
        Number(req.price_per_hour),
        req.owner_id,
        req.description,
        availability,
      ]
    );

    await pool.query(
      `
      UPDATE court_requests
      SET status='approved', reviewed_at=NOW(), reviewed_by=$1
      WHERE id=$2
      `,
      [admin.id, params.id]
    );

    return NextResponse.json({
      message: "Solicitud aprobada",
      courtId,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al aprobar solicitud" },
      { status: 500 }
    );
  }
}
