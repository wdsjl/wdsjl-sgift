import type { IncomingMessage } from "http";
import multer, { type FileFilterCallback } from "multer";
import { Readable } from "stream";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const BLOCKED_EXTENSIONS = new Set([
  "svg",
  "html",
  "htm",
  "js",
  "exe",
  "php",
]);

function createFileFilter() {
  return (
    _req: IncomingMessage,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      cb(new Error("不支持的文件类型，仅允许 JPEG、PNG、WebP"));
      return;
    }

    const extension = file.originalname.split(".").pop()?.toLowerCase();
    if (extension && BLOCKED_EXTENSIONS.has(extension)) {
      cb(new Error("不支持的文件扩展名"));
      return;
    }

    cb(null, true);
  };
}

export function createMulterUpload(maxSizeBytes: number) {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeBytes,
      files: 1,
    },
    fileFilter: createFileFilter(),
  });
}

export async function parseUpload(
  request: Request,
  maxSizeBytes: number
): Promise<Express.Multer.File> {
  const upload = createMulterUpload(maxSizeBytes);
  const contentType = request.headers.get("content-type") ?? "";
  const body = Buffer.from(await request.arrayBuffer());

  const stream = new Readable();
  stream.push(body);
  stream.push(null);

  const req = Object.assign(stream, {
    headers: {
      "content-type": contentType,
      "content-length": String(body.length),
    },
  }) as IncomingMessage & { file?: Express.Multer.File };

  return new Promise((resolve, reject) => {
    upload.single("file")(
      req as unknown as Parameters<ReturnType<typeof upload.single>>[0],
      {} as Parameters<ReturnType<typeof upload.single>>[1],
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        if (!req.file) {
          reject(new Error("请选择图片文件"));
          return;
        }

        resolve(req.file);
      }
    );
  });
}
