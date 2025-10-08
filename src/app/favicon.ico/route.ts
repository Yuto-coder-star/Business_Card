import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET(request: Request) {
  const redirectUrl = new URL("/icon.svg", request.url);
  return NextResponse.redirect(redirectUrl, 308);
}
