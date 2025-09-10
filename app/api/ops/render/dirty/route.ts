import { NextResponse } from "next/server";
import { runScript } from "@/lib/run";
export async function POST() { const r = await runScript("render:dirty"); return NextResponse.json(r); }
