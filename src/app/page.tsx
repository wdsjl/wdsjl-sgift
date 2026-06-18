import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#f5ebe0_0%,_transparent_60%)]" />
      <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-[#f0e0cc]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-0 h-48 w-48 rounded-full bg-[#e8ddd0]/50 blur-3xl" />

      <main className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <p className="mb-4 text-sm tracking-[0.25em] text-[#a89584] uppercase">
          纪念册 · 礼物空间
        </p>
        <h1 className="font-serif text-5xl leading-tight text-[#5c4a3a] sm:text-6xl">
          WDSJL&apos;s Gifts
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[#7a6555]">
          在一张温暖的背景图上，藏下每一份心意。
          <br />
          让 TA 慢慢发现，收集属于你的礼物。
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/create">
            <Button className="min-w-40">创建空间</Button>
          </Link>
        </div>

        <div className="mt-16 grid w-full grid-cols-3 gap-4 text-center text-xs text-[#a89584]">
          <div className="rounded-xl bg-white/40 px-3 py-4">
            <span className="mb-1 block text-lg">🖼</span>
            上传背景
          </div>
          <div className="rounded-xl bg-white/40 px-3 py-4">
            <span className="mb-1 block text-lg">✦</span>
            布置物品
          </div>
          <div className="rounded-xl bg-white/40 px-3 py-4">
            <span className="mb-1 block text-lg">🔗</span>
            分享链接
          </div>
        </div>
      </main>
    </div>
  );
}
