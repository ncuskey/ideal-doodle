import { NextResponse } from "next/server";
import { runScript } from "@/lib/run";

export async function POST(req: Request) {
  const { chain, hook } = await req.json();
  if (!chain || !hook) return NextResponse.json({ ok: false, error: "missing chain/hook" }, { status: 400 });
  const r = await runScript("quests:activate", ["--chain=" + chain, "--hook=" + hook]);
  return NextResponse.json(r);
}
