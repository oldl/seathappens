"use client";

import { STICKER_DEFS, getStickerSrc } from "@/lib/stickers";

interface StickerGridProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function StickerGrid({ selectedId, onSelect }: StickerGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-3xl bg-[#F1EEE6] p-4 sm:grid-cols-4">
      {STICKER_DEFS.map((s) => {
        const isSelected = s.id === selectedId;
        return (
          <button
            type="button"
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="relative flex aspect-square items-center justify-center rounded-2xl bg-white p-2 box-border transition-transform duration-150 hover:-translate-y-0.5"
            aria-pressed={isSelected}
            aria-label={`Choisir le sticker ${s.id}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getStickerSrc(s.id)} alt="sticker" className="w-full h-full object-contain" />
            {isSelected && (
              <div className="absolute -inset-[3px] border-[3px] border-ink rounded-[19px] pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
