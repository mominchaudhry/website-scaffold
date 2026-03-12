import { env } from "@/lib/env";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug = request.nextUrl.searchParams.get("slug") || "/";

  if (secret !== env.previewSecret) {
    return NextResponse.json({ error: "Invalid preview secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  const target = slug.startsWith("/") ? slug : `/${slug}`;
  return NextResponse.redirect(new URL(target, request.url));
}
