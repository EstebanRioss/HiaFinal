import { NextResponse } from "next/server";
import { query } from "@/lib/pg";

export async function GET() {
  try {
    const { rows } = await query("SELECT * FROM courts ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Error fetching courts:', err.message ?? err);
    return NextResponse.json({ error: 'Error fetching courts' }, { status: 500 });
  }
}
