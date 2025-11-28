import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/pg";
import { requireAuth, requireRole } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request as any);
    if (error) return error;

    if (user.role === "admin") {
      const { rows } = await pool.query("SELECT * FROM court_requests");
      return NextResponse.json({
        requests: rows.map((r: any) => ({
          ...r,
          price_per_hour: Number(r.price_per_hour),
          availability: r.availability
            ? typeof r.availability === 'string'
              ? JSON.parse(r.availability)
              : r.availability
            : null,
        })),
      });
    }

    const { rows } = await pool.query(
      "SELECT * FROM court_requests WHERE owner_id=$1",
      [user.id]
    );

    return NextResponse.json({
      requests: rows.map((r: any) => ({
        ...r,
        price_per_hour: Number(r.price_per_hour),
        availability: r.availability
          ? typeof r.availability === 'string'
            ? JSON.parse(r.availability)
            : r.availability
          : null,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Error al obtener solicitudes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(request as any);
    if (error) return error;

    const {
      name,
      sport,
      location,
      pricePerHour,
      description,
      availability,
    } = await request.json();

    if (!name || !sport || !location || !pricePerHour || !description)
      return NextResponse.json(
        { error: "Campos requeridos" },
        { status: 400 }
      );

    const id = uuid();

    await pool.query(
      `
      INSERT INTO court_requests
      (id,owner_id,name,sport,location,price_per_hour,description,status,created_at,availability)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',NOW(),$8)
    `,
      [
        id,
        user.id,
        name,
        sport,
        location,
        Number(pricePerHour),
        description,
        JSON.stringify(availability),
      ]
    );

    return NextResponse.json({
      message: "Solicitud enviada",
      request: { id },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Error al crear solicitud" },
      { status: 500 }
    );
  }
}
