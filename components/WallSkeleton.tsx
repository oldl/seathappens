export default function WallSkeleton() {
  return (
    <div className="grid gap-4.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))" }}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[20px] bg-white/80 px-2.5 pt-4 pb-3.5 shadow-[0_4px_0_rgba(0,0,0,0.05)]"
        >
          <div className="mx-auto h-[76px] w-[76px] rounded-full bg-cream/80" />
          <div className="mx-auto mt-3 h-4 w-20 rounded-full bg-cream/80" />
        </div>
      ))}
    </div>
  );
}
