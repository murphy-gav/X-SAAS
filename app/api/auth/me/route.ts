// app/api/auth/me/route.ts
import { getUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}