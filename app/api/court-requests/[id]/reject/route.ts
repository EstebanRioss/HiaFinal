import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/pg";
import { requireRole } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin: any = requireRole(request as any, ["admin"] as any);

    const { rows } = await pool.query(
      "SELECT * FROM court_requests WHERE id=$1",
      [params.id]
    );

    if (!rows[0])
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );

    await pool.query(
      `UPDATE court_requests 
       SET status='rejected', reviewed_at=NOW(), reviewed_by=$1 
       WHERE id=$2`,
      [admin.id, params.id]
    );

    return NextResponse.json({ message: "Solicitud rechazada" });
  } catch {
    return NextResponse.json(
      { error: "Error al rechazar solicitud" },
      { status: 500 }
    );
  }
}
