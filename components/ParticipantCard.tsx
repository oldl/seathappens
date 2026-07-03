interface ParticipantCardProps {
  pseudo: string;
  src: string;
}

export default function ParticipantCard({ pseudo, src }: ParticipantCardProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-[20px] bg-white px-2.5 pb-3.5 pt-4 shadow-[0_4px_0_rgba(0,0,0,0.08)] transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-cream/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={pseudo} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="font-display font-bold text-sm text-ink text-center truncate max-w-full">{pseudo}</div>
    </div>
  );
}
