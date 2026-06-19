import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-4xl">🍂</p>
      <h1 className="font-serif text-2xl text-[#5c4a3a]">页面未找到</h1>
      <p className="mt-2 text-sm text-[#a89584]">
        这个空间可能尚未发布，或链接已失效。
      </p>
      <Link
        href="/"
        className="mt-6 text-sm text-[#c4956a] underline-offset-2 hover:underline"
      >
        返回首页
      </Link>
    </div>
  );
}
