import { env } from "@/lib/env";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface RevalidatePayload {
  secret?: string;
  tags?: string[];
  paths?: string[];
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as RevalidatePayload;
  const secret = payload.secret || request.headers.get("x-revalidate-secret");

  if (!secret || secret !== env.revalidateSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const tags = payload.tags || [];
  const paths = payload.paths || [];

  for (const tag of tags) {
    revalidateTag(tag);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, tags, paths });
}
