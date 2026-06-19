import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { UPLOAD_ROOT } from "@/lib/upload";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["backgrounds", "items"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (
    segments.length !== 2 ||
    !ALLOWED_FOLDERS.has(segments[0]) ||
    !segments[1].endsWith(".webp")
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.resolve(UPLOAD_ROOT, ...segments);
  const uploadsRoot = path.resolve(UPLOAD_ROOT);

  if (!filePath.startsWith(uploadsRoot)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const file = await fs.readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
