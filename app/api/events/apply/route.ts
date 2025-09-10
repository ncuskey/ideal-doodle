import { NextResponse } from "next/server";
import { runScript } from "@/lib/run";

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  const r = await runScript("events:apply", ["--id=" + id]);
  return NextResponse.json(r);
}
