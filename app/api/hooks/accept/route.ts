import { NextResponse } from "next/server";
import { runScript } from "@/lib/run";

export async function POST(req: Request) {
  const { suggIds = [] } = await req.json();
  if (!Array.isArray(suggIds) || !suggIds.length) return NextResponse.json({ ok: false, error: "no suggIds" }, { status: 400 });
  const args = ["--sugg=" + suggIds.join(",")];
  const r = await runScript("hooks:accept", args);
  return NextResponse.json(r);
}
