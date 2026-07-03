"use client";

interface AvatarPreviewProps {
  src: string;
}

export default function AvatarPreview({ src }: AvatarPreviewProps) {
  return (
    <div className="flex flex-col items-center pt-2.5 lg:sticky lg:top-8">
      <div className="relative flex aspect-square w-[min(280px,70vw)] items-center justify-center rounded-[70%_30%_65%_35%/55%_45%_55%_45%] bg-sh-purple">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="avatar preview" className="w-[72%] h-[72%] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.12)]" />
        <div className="absolute top-[6%] right-[2%] font-display text-2xl text-ink rotate-12">!!!</div>
      </div>
      <div className="mt-5 font-display font-bold text-lg text-ink border-b-[3px] border-sh-purple pb-1">
        ça te va bien !
      </div>
    </div>
  );
}
