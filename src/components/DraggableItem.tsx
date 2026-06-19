"use client";

import Image from "next/image";
import type { Item } from "@/lib/types";
import { useCallback, useRef } from "react";

interface DraggableItemProps {
  item: Item;
  editable?: boolean;
  selected?: boolean;
  discovered?: boolean;
  onSelect?: (item: Item) => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
  onClick?: (item: Item) => void;
}

export function DraggableItem({
  item,
  editable = false,
  selected = false,
  discovered = true,
  onSelect,
  onPositionChange,
  onClick,
}: DraggableItemProps) {
  const dragging = useRef(false);

  const updatePosition = useCallback(
    (clientX: number, clientY: number, container: HTMLElement) => {
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.min(96, Math.max(4, x));
      const clampedY = Math.min(96, Math.max(4, y));
      onPositionChange?.(item.id, clampedX, clampedY);
    },
    [item.id, onPositionChange]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!editable) return;

    event.preventDefault();
    dragging.current = true;
    onSelect?.(item);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!editable || !dragging.current) return;

    const container = event.currentTarget.parentElement;
    if (!container) return;

    updatePosition(event.clientX, event.clientY, container);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!editable) return;
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleClick = () => {
    if (editable) {
      onSelect?.(item);
      return;
    }
    onClick?.(item);
  };

  return (
    <button
      type="button"
      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ${
        editable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer hover:scale-110"
      } ${selected ? "z-20 scale-110" : "z-10"} ${
        !editable && !discovered ? "animate-pulse" : ""
      }`}
      style={{
        left: `${item.position_x}%`,
        top: `${item.position_y}%`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      aria-label={item.title || "物品"}
    >
      <div
        className={`relative h-14 w-14 overflow-hidden rounded-full border-2 bg-white/90 shadow-md transition ${
          selected
            ? "border-[#c4956a] shadow-[#c4956a]/30"
            : discovered
              ? "border-white/90"
              : "border-[#f0d9b5]"
        }`}
      >
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f5ebe0] text-lg text-[#c4956a]">
            ✦
          </div>
        )}
      </div>
      {!editable && item.title && (
        <span className="pointer-events-none absolute left-1/2 top-full mt-1 max-w-24 -translate-x-1/2 truncate text-center text-xs text-white drop-shadow-md">
          {item.title}
        </span>
      )}
    </button>
  );
}
