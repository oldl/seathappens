interface ParticipantCardProps {
  pseudo: string;
  src: string;
  projectIdea: string;
  themeFocus: string;
  onOpen: () => void;
}

export default function ParticipantCard({ pseudo, src, projectIdea, themeFocus, onOpen }: ParticipantCardProps) {
  const teaser = projectIdea || themeFocus || "Clique pour en savoir plus";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col items-center gap-2.5 rounded-[24px] bg-white px-4 pb-4 pt-5 text-center shadow-[0_5px_0_rgba(0,0,0,0.08)] transition-transform duration-150 hover:-translate-y-1"
      aria-label={`Voir la vibe de ${pseudo}`}
    >
      <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-cream/70 transition-transform duration-150 hover:scale-105">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={pseudo} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="max-w-full truncate font-display text-base font-bold text-ink">{pseudo}</div>
      <div className="line-clamp-1 min-h-[16px] text-[11px] font-semibold uppercase tracking-wide text-ink/45">
        {teaser}
      </div>
      <div className="mt-1 rounded-full bg-sh-purple/10 px-3 py-1 font-body text-xs font-semibold text-sh-purple">
        Voir sa vibe
      </div>
    </button>
  );
}
