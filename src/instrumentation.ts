export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureUploadDirs } = await import("@/lib/upload");
    await ensureUploadDirs();
  }
}
