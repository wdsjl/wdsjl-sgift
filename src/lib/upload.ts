import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
export const BACKGROUNDS_DIR = path.join(UPLOAD_ROOT, "backgrounds");
export const ITEMS_DIR = path.join(UPLOAD_ROOT, "items");
export const TEMP_DIR = path.join(UPLOAD_ROOT, "temp");

const ALLOWED_FOLDERS = new Set(["backgrounds", "items"]);

export async function ensureUploadDirs(): Promise<void> {
  await Promise.all([
    fs.mkdir(BACKGROUNDS_DIR, { recursive: true }),
    fs.mkdir(ITEMS_DIR, { recursive: true }),
    fs.mkdir(TEMP_DIR, { recursive: true }),
  ]);
}

export function generateUniqueFilename(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = randomBytes(3).toString("hex");
  return `${timestamp}-${random}.webp`;
}

export function urlFromFilename(
  folder: "backgrounds" | "items",
  filename: string
): string {
  return `/uploads/${folder}/${filename}`;
}

export function filePathFromUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith("/uploads/")) return null;

  const relative = url.replace(/^\/uploads\//, "");
  const segments = relative.split("/");

  if (segments.length !== 2 || !ALLOWED_FOLDERS.has(segments[0])) {
    return null;
  }

  const resolved = path.resolve(UPLOAD_ROOT, relative);
  const uploadsRoot = path.resolve(UPLOAD_ROOT);

  if (!resolved.startsWith(uploadsRoot)) {
    return null;
  }

  return resolved;
}

export async function deleteFile(url: string | null | undefined): Promise<void> {
  const filePath = filePathFromUrl(url);
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function processImage(
  inputBuffer: Buffer,
  outputDir: string,
  maxEdge: number,
  quality: number
): Promise<string> {
  await ensureUploadDirs();

  const tempName = `tmp-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const tempPath = path.join(TEMP_DIR, tempName);
  const filename = generateUniqueFilename();
  const outputPath = path.join(outputDir, filename);

  try {
    await fs.writeFile(tempPath, inputBuffer);

    await sharp(tempPath)
      .rotate()
      .resize(maxEdge, maxEdge, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(outputPath);
  } finally {
    await fs.unlink(tempPath).catch(() => undefined);
  }

  const folder = outputDir === BACKGROUNDS_DIR ? "backgrounds" : "items";
  return urlFromFilename(folder, filename);
}

export async function saveBackgroundImage(buffer: Buffer): Promise<string> {
  return processImage(buffer, BACKGROUNDS_DIR, 1920, 80);
}

export async function saveItemImage(buffer: Buffer): Promise<string> {
  return processImage(buffer, ITEMS_DIR, 800, 80);
}

export async function deleteFiles(urls: Array<string | null | undefined>): Promise<void> {
  await Promise.all(urls.map((url) => deleteFile(url)));
}
