import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/pg";

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole(req, "owner");
  if (error) return error;

  const { rows } = await query("SELECT * FROM courts WHERE owner_id = $1", [user!.id]);
  return NextResponse.json(rows);
}
