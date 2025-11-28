import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/pg";

export async function GET() {
  try {
    const { rows } = await query("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC");
    return NextResponse.json({ users: rows });
  } catch (err: any) {
    console.error('Error fetching users:', err.message ?? err);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}
