import { NextResponse } from "next/server";
import { runScript } from "@/lib/run";
export async function POST() { const r = await runScript("overlays:build"); return NextResponse.json(r); }
