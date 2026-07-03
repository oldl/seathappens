import ShareButton from "@/components/ShareButton";
import WallParticipants from "@/components/WallParticipants";
import type { Participant } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabaseClient";

// Always fetch a fresh participant list — this is a live public wall.
export const dynamic = "force-dynamic";

export default async function WallPage() {
  const supabase = getSupabaseServerClient();
  let participants: Participant[] = [];
  let errorMessage = "";

  if (!supabase) {
    errorMessage =
      "Impossible de charger la liste pour l'instant. Vérifie NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  } else {
    const { data, error } = await supabase.from("participants").select("*").order("created_at", { ascending: false });

    if (error) {
      errorMessage = "Impossible de charger la liste pour l'instant. Vérifie ta configuration Supabase (.env.local).";
    } else {
      participants = (data as Participant[]) || [];
    }
  }

  const participantCount = participants.length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#C7BBFA] font-body box-border">
      <svg width="150" height="150" viewBox="0 0 150 150" className="pointer-events-none absolute -right-8 top-8 opacity-70" fill="none">
        <path d="M20 65C40 20 112 18 126 58C137 88 106 117 74 106C54 99 50 80 65 71C84 59 100 81 87 101" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <svg width="120" height="120" viewBox="0 0 120 120" className="pointer-events-none absolute -left-4 bottom-16 opacity-60" fill="none">
        <path d="M18 86C38 68 43 44 31 28C53 34 77 31 96 16C86 35 90 53 106 71C84 64 60 72 44 92" stroke="#FF6FA5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="max-w-[1180px] mx-auto px-4 pt-7 pb-16 sm:px-5 sm:pt-8">
        <a href="/" className="inline-block font-body font-semibold text-sm text-ink opacity-75 mb-4.5 no-underline">
          ← Modifier mon avatar
        </a>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-block rounded-[22px] bg-white px-4.5 py-2.5 -rotate-2 shadow-[0_6px_0_rgba(0,0,0,0.08)]">
              <div className="font-display text-[28px] font-extrabold text-ink leading-none">SEATHAPPENS</div>
            </div>
            <div className="mt-3 inline-block rounded-full bg-sh-yellow px-4.5 py-2 font-display text-sm font-bold text-ink shadow-[0_4px_0_rgba(0,0,0,0.08)]">
              {participantCount} {participantCount > 1 ? "personnes" : "personne"} dans la place 🎉
            </div>
          </div>
          <ShareButton />
        </div>

        {errorMessage && (
          <div className="rounded-[28px] border-2 border-white/60 bg-white/45 px-6 py-16 text-center text-sm text-ink/70">
            {errorMessage}
          </div>
        )}

        {!errorMessage && <WallParticipants initialParticipants={participants} />}
      </div>
    </div>
  );
}
