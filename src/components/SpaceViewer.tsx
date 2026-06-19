"use client";

import type { SpaceWithItems, Item } from "@/lib/types";
import { BackgroundCanvas } from "./BackgroundCanvas";
import { ProgressBadge } from "./ProgressBadge";
import { CompletionToast } from "./CompletionToast";
import { Modal } from "./ui/Modal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getDiscoveredIds, markDiscovered } from "@/lib/progress";

interface SpaceViewerProps {
  space: SpaceWithItems;
}

export function SpaceViewer({ space }: SpaceViewerProps) {
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isNewDiscovery, setIsNewDiscovery] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    setDiscoveredIds(getDiscoveredIds(space.slug));
  }, [space.slug]);

  const handleItemClick = (item: Item) => {
    const wasDiscovered = discoveredIds.includes(item.id);
    setSelectedItem(item);
    setIsNewDiscovery(!wasDiscovered);

    const next = markDiscovered(space.slug, item.id);
    setDiscoveredIds(next);

    if (
      !wasDiscovered &&
      space.items.length > 0 &&
      next.length === space.items.length
    ) {
      setShowCompletion(true);
    }
  };

  return (
    <div className="relative min-h-screen">
      <ProgressBadge
        discovered={discoveredIds.length}
        total={space.items.length}
      />

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm tracking-[0.2em] text-[#a89584] uppercase">
            WDSJL&apos;s Gifts
          </p>
          <h1 className="font-serif text-3xl text-[#5c4a3a] sm:text-4xl">
            {space.title}
          </h1>
          <p className="mt-2 text-sm text-[#a89584]">
            点击场景中的物品，发现藏在其中的心意
          </p>
        </header>

        <BackgroundCanvas
          backgroundUrl={space.background_url}
          items={space.items}
          discoveredIds={discoveredIds}
          onItemClick={handleItemClick}
        />
      </div>

      <Modal
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title}
      >
        {selectedItem && (
          <div className="space-y-4">
            {selectedItem.thumbnail_url && (
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-2 border-[#e8ddd0]">
                <Image
                  src={selectedItem.thumbnail_url}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized
                />
              </div>
            )}
            {isNewDiscovery && (
              <p className="text-center text-sm font-medium text-[#c4956a]">
                ✦ 新发现！
              </p>
            )}
            <p className="whitespace-pre-wrap text-center text-[#7a6555] leading-relaxed">
              {selectedItem.description || "这份礼物还没有写下描述。"}
            </p>
          </div>
        )}
      </Modal>

      <CompletionToast
        show={showCompletion}
        onClose={() => setShowCompletion(false)}
      />
    </div>
  );
}
