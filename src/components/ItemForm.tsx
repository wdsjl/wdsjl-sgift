"use client";

import type { Item } from "@/lib/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  deleteItem,
  updateItem,
  updateItemThumbnail,
} from "@/lib/actions/items";

interface ItemFormProps {
  item: Item;
  spaceId: string;
  onDeleted: () => void;
}

export function ItemForm({ item, spaceId, onDeleted }: ItemFormProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [thumbnailUrl, setThumbnailUrl] = useState(item.thumbnail_url);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const saveField = (field: "title" | "description", value: string) => {
    startTransition(async () => {
      await updateItem(item.id, spaceId, { [field]: value });
    });
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const response = await fetch("/api/upload/item", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "物品图片上传失败");
        }

        await updateItemThumbnail(item.id, spaceId, data.url);
        setThumbnailUrl(data.url);
      } catch (error) {
        alert(error instanceof Error ? error.message : "物品图片上传失败");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("确定删除这个物品吗？")) return;

    startTransition(async () => {
      await deleteItem(item.id, spaceId);
      onDeleted();
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#e8ddd0] bg-white/50 p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-[#d4c4b0] bg-[#faf7f2] transition hover:border-[#c4956a]"
        >
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl text-[#c4956a]">
              +
            </span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleThumbnailUpload}
        />
        <p className="text-xs text-[#a89584]">点击上传缩略图，拖拽画布上的圆点调整位置</p>
      </div>

      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => saveField("title", title)}
        placeholder="给这个礼物起个名字"
      />

      <Textarea
        label="描述"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => saveField("description", description)}
        placeholder="写下你想说的话..."
      />

      <div className="flex justify-end">
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isPending}
        >
          删除物品
        </Button>
      </div>
    </div>
  );
}
