"use client";

import Image from "next/image";
import type { Item } from "@/lib/types";
import { DraggableItem } from "./DraggableItem";

interface BackgroundCanvasProps {
  backgroundUrl: string | null;
  items: Item[];
  editable?: boolean;
  selectedItemId?: string | null;
  discoveredIds?: string[];
  onItemSelect?: (item: Item) => void;
  onItemPositionChange?: (id: string, x: number, y: number) => void;
  onItemClick?: (item: Item) => void;
}

export function BackgroundCanvas({
  backgroundUrl,
  items,
  editable = false,
  selectedItemId,
  discoveredIds = [],
  onItemSelect,
  onItemPositionChange,
  onItemClick,
}: BackgroundCanvasProps) {
  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[#e8ddd0] bg-[#f5ebe0] shadow-inner">
      <div className="relative aspect-[4/3] w-full">
        {backgroundUrl ? (
          <Image
            src={backgroundUrl}
            alt="空间背景"
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#a89584]">
            <span className="text-4xl opacity-40">🖼</span>
            <p className="text-sm">上传一张背景图，开始布置你的礼物空间</p>
          </div>
        )}

        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            editable={editable}
            selected={selectedItemId === item.id}
            discovered={discoveredIds.includes(item.id)}
            onSelect={onItemSelect}
            onPositionChange={onItemPositionChange}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}
