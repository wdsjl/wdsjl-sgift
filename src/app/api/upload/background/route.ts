import { parseUpload } from "@/lib/multer";
import { saveBackgroundImage } from "@/lib/upload";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const file = await parseUpload(request, MAX_SIZE);
    const url = await saveBackgroundImage(file.buffer);

    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "背景图上传失败";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
