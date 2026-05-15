import { NextResponse } from "next/server";
import { validateClub } from "@/lib/clubs/seed";

export async function POST(request: Request) {
  const { clubCode, clubPassword } = await request.json();
  const club = validateClub(String(clubCode ?? ""), String(clubPassword ?? ""));
  if (!club) return NextResponse.json({ ok: false, message: "That code does not look right. Please check with your club." });
  const safeClub = { ...club, clubPassword: undefined };
  return NextResponse.json({ ok: true, club: safeClub });
}
