"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { STICKER_DEFS, getStickerSrc } from "@/lib/stickers";
import StickerGrid from "@/components/StickerGrid";
import DrawCanvas from "@/components/DrawCanvas";
import AvatarPreview from "@/components/AvatarPreview";

type AvatarTab = "sticker" | "draw";
type ErrorKind = "" | "pseudo" | "duplicate" | "avatar" | "server";
const JUST_JOINED_KEY = "seathappens_just_joined";

export default function HomePage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [avatarTab, setAvatarTab] = useState<AvatarTab>("sticker");
  const [selectedSticker, setSelectedSticker] = useState(STICKER_DEFS[0].id);
  const [drawingDataUrl, setDrawingDataUrl] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState<ErrorKind>("");
  const [submitting, setSubmitting] = useState(false);

  const previewSrc =
    avatarTab === "sticker" ? getStickerSrc(selectedSticker) : drawingDataUrl || getStickerSrc(STICKER_DEFS[0].id);

  const avatarReady = avatarTab === "sticker" ? true : hasDrawn;
  const trimmedPseudo = pseudo.trim();
  const pseudoTooLong = trimmedPseudo.length > 24;
  const canJoin = trimmedPseudo.length > 0 && !pseudoTooLong && avatarReady && !submitting;

  async function handleJoin() {
    const pseudoTrimmed = pseudo.trim();
    if (!pseudoTrimmed || pseudoTooLong) {
      setError("pseudo");
      return;
    }
    if (avatarTab === "draw" && !hasDrawn) {
      setError("avatar");
      return;
    }

    setSubmitting(true);
    setError("");

    const avatar_type = avatarTab;
    const avatar_value = avatarTab === "sticker" ? selectedSticker : drawingDataUrl;
    const supabase = getSupabaseBrowserClient();

    // Optimistic UI: stash the just-joined participant so /wall can render it instantly
    // even before the round trip to Supabase settles.
    try {
      sessionStorage.setItem(
        JUST_JOINED_KEY,
        JSON.stringify({ pseudo: pseudoTrimmed, avatar_type, avatar_value })
      );
    } catch {
      // sessionStorage may be unavailable — non-fatal, wall will just fetch fresh
    }

    if (!supabase) {
      setSubmitting(false);
      setError("server");
      return;
    }

    const { error: insertError } = await supabase
      .from("participants")
      .insert({ pseudo: pseudoTrimmed, avatar_type, avatar_value });

    if (insertError) {
      setSubmitting(false);
      try {
        sessionStorage.removeItem(JUST_JOINED_KEY);
      } catch {
        // Ignore sessionStorage failures while rolling back the optimistic flow.
      }
      // Postgres unique_violation on the case-insensitive pseudo index
      if (insertError.code === "23505") {
        setError("duplicate");
      } else {
        setError("server");
      }
      return;
    }

    router.push("/wall");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream font-body box-border">
      <svg width="90" height="90" viewBox="0 0 90 90" className="pointer-events-none absolute -top-2.5 -right-2.5" fill="none">
        <path d="M20 70C20 70 20 30 45 30C60 30 60 45 45 45C32 45 32 20 55 20" stroke="#FF6FA5" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <svg width="70" height="70" viewBox="0 0 70 70" className="pointer-events-none absolute top-[110px] -left-2.5" fill="none">
        <circle cx="35" cy="35" r="26" stroke="#3E6CF4" strokeWidth="6" />
        <circle cx="35" cy="35" r="12" stroke="#3E6CF4" strokeWidth="6" />
      </svg>
      <svg width="100" height="56" viewBox="0 0 100 56" className="pointer-events-none absolute bottom-16 right-4 hidden sm:block" fill="none">
        <path d="M6 30C19 8 37 7 46 24C52 36 63 41 80 29C87 24 91 18 94 12" stroke="#FF7A45" strokeWidth="5" strokeLinecap="round" />
        <path d="M79 16L95 10L91 27" stroke="#FF7A45" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="pointer-events-none absolute -left-10 top-[280px] h-[220px] w-[150px] rounded-[70%_30%_65%_35%/60%_40%_60%_40%] bg-[#FF9FC4] opacity-55" />

      <div className="relative z-10 mx-auto max-w-[1180px] px-6 pb-16 pt-7 sm:px-8 sm:pt-8 lg:px-10">
        <div className="inline-block -rotate-2 rounded-[20px] bg-sh-yellow px-6 pb-4.5 pt-3.5 shadow-[0_6px_0_rgba(0,0,0,0.08)] sm:px-7">
          <div className="font-display text-[clamp(26px,4vw,40px)] font-extrabold tracking-wide text-ink leading-none">
            SEATHAPPENS
          </div>
          <div className="mt-2 inline-block border-b-[3px] border-sh-green pb-0.5 font-body text-sm font-medium text-ink">
            be there. be you. be fun.
          </div>
        </div>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,620px)_minmax(260px,1fr)] lg:gap-12">
          <div>
            <div className="font-display font-bold text-xl text-ink mb-3">1. TON PSEUDO</div>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => {
                setPseudo(e.target.value);
                setError("");
              }}
              placeholder="Ton pseudo"
              maxLength={24}
              className="w-full box-border rounded-2xl bg-white px-4.5 py-4 font-body text-base font-medium outline-none transition focus:border-sh-purple"
              style={{ border: `2px solid ${error === "pseudo" || error === "duplicate" ? "#E8543E" : "#E5DFD3"}` }}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <div>
                {error === "pseudo" && (
                  <div className="font-semibold text-[#E8543E]">Hop hop, il te faut un pseudo valable pour entrer ! ✏️</div>
                )}
                {error === "duplicate" && (
                  <div className="font-semibold text-[#E8543E]">Ce pseudo est déjà pris, essaie autre chose 🙈</div>
                )}
                {error === "server" && (
                  <div className="font-semibold text-[#E8543E]">Oups, un souci est survenu. Réessaie !</div>
                )}
              </div>
              <div className={`shrink-0 font-medium ${pseudoTooLong ? "text-[#E8543E]" : "text-ink/55"}`}>
                {trimmedPseudo.length}/24
              </div>
            </div>

            <div className="font-display font-bold text-xl text-ink mt-7 mb-3.5">2. TON AVATAR</div>
            <div className="flex gap-2.5 mb-4 flex-wrap">
              <button
                type="button"
                onClick={() => setAvatarTab("sticker")}
                className="rounded-2xl font-display font-bold text-sm cursor-pointer flex items-center gap-2"
                style={
                  avatarTab === "sticker"
                    ? { background: "#8A7CFB", color: "#fff", border: "none", padding: "11px 20px" }
                    : { background: "#fff", color: "#1A1A1A", border: "2px solid #E5DFD3", padding: "9px 20px" }
                }
              >
                🎨 Choisir un sticker
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab("draw")}
                className="rounded-2xl font-display font-bold text-sm cursor-pointer flex items-center gap-2"
                style={
                  avatarTab === "draw"
                    ? { background: "#8A7CFB", color: "#fff", border: "none", padding: "11px 20px" }
                    : { background: "#fff", color: "#1A1A1A", border: "2px solid #E5DFD3", padding: "9px 20px" }
                }
              >
                ✏️ Dessiner
              </button>
            </div>

            {avatarTab === "sticker" ? (
              <StickerGrid selectedId={selectedSticker} onSelect={setSelectedSticker} />
            ) : (
              <>
                <DrawCanvas
                  onChange={(url, drawn) => {
                    setDrawingDataUrl(url);
                    setHasDrawn(drawn);
                    setError("");
                  }}
                />
                {error === "avatar" && (
                  <div className="text-[#E8543E] text-sm font-semibold mt-2">
                    Dessine ton petit chef-d&apos;œuvre avant de continuer 🎨
                  </div>
                )}
              </>
            )}

            <div className="mt-6.5">
              <button
                type="button"
                onClick={handleJoin}
                disabled={!canJoin}
                className="flex items-center gap-3 rounded-full border-none pl-7 pr-8 py-4.5 font-display text-lg font-bold tracking-wide transition-transform duration-150 disabled:translate-y-0 sm:pl-8 sm:pr-9"
                style={
                  canJoin
                    ? { background: "#1A1A1A", color: "#fff", cursor: "pointer" }
                    : { background: "#E5DFD3", color: "#9C9585", cursor: "not-allowed" }
                }
              >
                {submitting ? "ÇA PART EN SALLE..." : "REJOINDRE LA SALLE"} <span>→</span>
              </button>
            </div>
          </div>

          <AvatarPreview src={previewSrc} />
        </div>
      </div>
    </div>
  );
}
