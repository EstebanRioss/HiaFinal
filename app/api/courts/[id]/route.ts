import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/pg";

export async function GET(req: NextRequest, { params }: any) {
  const { id } = params;

  const { rows } = await query("SELECT * FROM courts WHERE id = $1", [id]);
  if (!rows.length) return NextResponse.json({ error: "Court not found" }, { status: 404 });

  return NextResponse.json(rows[0]);
}
