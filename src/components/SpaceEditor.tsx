"use client";

import type { SpaceWithItems, Item } from "@/lib/types";
import { BackgroundCanvas } from "./BackgroundCanvas";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ItemForm } from "./ItemForm";
import { useCallback, useRef, useState, useTransition } from "react";
import {
  publishSpace,
  unpublishSpace,
  updateSpaceBackground,
  updateSpaceTitle,
} from "@/lib/actions/spaces";
import { createItem, updateItem } from "@/lib/actions/items";
import { useRouter } from "next/navigation";

interface SpaceEditorProps {
  space: SpaceWithItems;
}

export function SpaceEditor({ space: initialSpace }: SpaceEditorProps) {
  const router = useRouter();
  const [space, setSpace] = useState(initialSpace);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    initialSpace.items[0]?.id ?? null
  );
  const [shareUrl, setShareUrl] = useState<string | null>(
    initialSpace.is_published
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/s/${initialSpace.slug}`
      : null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bgFileRef = useRef<HTMLInputElement>(null);

  const selectedItem = space.items.find((item) => item.id === selectedItemId);

  const handleTitleBlur = (title: string) => {
    startTransition(async () => {
      await updateSpaceTitle(space.id, title);
      setSpace((prev) => ({ ...prev, title }));
    });
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const response = await fetch("/api/upload/background", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "背景图上传失败");
        }

        await updateSpaceBackground(space.id, data.url);
        setSpace((prev) => ({ ...prev, background_url: data.url }));
        setMessage("背景图已上传");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "背景图上传失败");
      } finally {
        if (bgFileRef.current) bgFileRef.current.value = "";
      }
    });
  };

  const handleAddItem = () => {
    startTransition(async () => {
      const item = await createItem(space.id);
      setSpace((prev) => ({ ...prev, items: [...prev.items, item] }));
      setSelectedItemId(item.id);
    });
  };

  const handlePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      setSpace((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, position_x: x, position_y: y } : item
        ),
      }));
    },
    []
  );

  const handlePositionCommit = (id: string, x: number, y: number) => {
    startTransition(async () => {
      await updateItem(id, space.id, { position_x: x, position_y: y });
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      try {
        const url = await publishSpace(space.id);
        setSpace((prev) => ({ ...prev, is_published: true }));
        setShareUrl(url);
        setMessage("空间已发布！");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "发布失败");
      }
    });
  };

  const handleUnpublish = () => {
    startTransition(async () => {
      await unpublishSpace(space.id);
      setSpace((prev) => ({ ...prev, is_published: false }));
      setMessage("已取消发布");
    });
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setMessage("链接已复制到剪贴板");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm tracking-widest text-[#a89584] uppercase">
            编辑空间
          </p>
          <Input
            defaultValue={space.title}
            onBlur={(e) => handleTitleBlur(e.target.value)}
            className="!border-0 !bg-transparent !px-0 font-serif text-2xl !text-[#5c4a3a] !shadow-none focus:!ring-0"
            placeholder="空间名称"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => bgFileRef.current?.click()}
            disabled={isPending}
          >
            上传背景
          </Button>
          <Button variant="secondary" onClick={handleAddItem} disabled={isPending}>
            添加物品
          </Button>
          {space.is_published ? (
            <>
              <Button variant="secondary" onClick={copyLink}>
                复制链接
              </Button>
              <Button variant="ghost" onClick={handleUnpublish} disabled={isPending}>
                取消发布
              </Button>
            </>
          ) : (
            <Button onClick={handlePublish} disabled={isPending}>
              发布空间
            </Button>
          )}
        </div>
        <input
          ref={bgFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleBackgroundUpload}
        />
      </header>

      {message && (
        <div className="mb-4 rounded-xl bg-[#f0e8dc] px-4 py-2 text-sm text-[#5c4a3a]">
          {message}
        </div>
      )}

      {shareUrl && space.is_published && (
        <div className="mb-6 rounded-2xl border border-[#d4e8d0] bg-[#f5faf3] px-5 py-4">
          <p className="mb-1 text-sm font-medium text-[#5a7a52]">分享链接</p>
          <p className="break-all font-mono text-sm text-[#4a6a42]">{shareUrl}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <BackgroundCanvas
          backgroundUrl={space.background_url}
          items={space.items}
          editable
          selectedItemId={selectedItemId}
          onItemSelect={(item: Item) => setSelectedItemId(item.id)}
          onItemPositionChange={(id, x, y) => {
            handlePositionChange(id, x, y);
            handlePositionCommit(id, x, y);
          }}
        />

        <aside className="space-y-4">
          <h2 className="font-serif text-lg text-[#5c4a3a]">物品详情</h2>
          {selectedItem ? (
            <ItemForm
              key={selectedItem.id}
              item={selectedItem}
              spaceId={space.id}
              onDeleted={() => {
                setSpace((prev) => ({
                  ...prev,
                  items: prev.items.filter((i) => i.id !== selectedItem.id),
                }));
                setSelectedItemId(null);
              }}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e8ddd0] p-8 text-center text-sm text-[#a89584]">
              添加物品后，点击画布上的圆点进行编辑
            </div>
          )}

          {space.items.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs tracking-wide text-[#a89584] uppercase">
                全部物品 ({space.items.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {space.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      selectedItemId === item.id
                        ? "bg-[#c4956a] text-white"
                        : "bg-white/70 text-[#7a6555] hover:bg-white"
                    }`}
                  >
                    {item.title || "未命名"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <footer className="mt-10 text-center">
        <Button variant="ghost" onClick={() => router.push("/")}>
          返回首页
        </Button>
      </footer>
    </div>
  );
}
