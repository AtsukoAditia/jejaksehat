import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    application: "JejakSehat",
    version: "0.1.0",
    dataProvider: process.env.DATA_PROVIDER ?? "sheets",
    timestamp: new Date().toISOString(),
  });
}
