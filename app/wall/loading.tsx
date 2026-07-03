import WallSkeleton from "@/components/WallSkeleton";

export default function LoadingWallPage() {
  return (
    <div className="min-h-screen bg-[#C7BBFA] font-body">
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-7 sm:px-5">
        <div className="mb-5 h-5 w-36 animate-pulse rounded-full bg-white/60" />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="h-14 w-52 animate-pulse rounded-3xl bg-white/75" />
            <div className="h-10 w-56 animate-pulse rounded-full bg-[#FFD93D]/80" />
          </div>
          <div className="h-12 w-44 animate-pulse rounded-full bg-white/75" />
        </div>

        <WallSkeleton />
      </div>
    </div>
  );
}
