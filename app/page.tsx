"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { STICKER_DEFS, getStickerSrc } from "@/lib/stickers";
import StickerGrid from "@/components/StickerGrid";
import DrawCanvas from "@/components/DrawCanvas";
import AvatarPreview from "@/components/AvatarPreview";

type AvatarTab = "sticker" | "draw";
type ErrorKind = "" | "pseudo" | "duplicate" | "server";
const JUST_JOINED_KEY = "seathappens_just_joined";
const VIBE_SEPARATOR = " • ";
const VIBE_OPTIONS = [
  "🚀 Lancer un side-project",
  "🎨 Faire un truc creatif",
  "🌍 Imaginer un impact positif",
  "🍽️ J'aime bien manger en ecoutant quelqu'un parler d'un truc",
  "🩺 Prototyper en moins de 0,1 QAP un projet pour Partenamut",
  "💥 J'ai une idee revolutionnaire qui va tout depoter",
  "👨‍👩‍👦 Je veux expliquer le vibe coding a mes parents le dimanche midi",
] as const;

export default function HomePage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [themeFocus, setThemeFocus] = useState("");
  const [avatarTab, setAvatarTab] = useState<AvatarTab>("sticker");
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [randomStickerId] = useState(() => STICKER_DEFS[Math.floor(Math.random() * STICKER_DEFS.length)]?.id ?? STICKER_DEFS[0].id);
  const [drawingDataUrl, setDrawingDataUrl] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState<ErrorKind>("");
  const [submitting, setSubmitting] = useState(false);
  const [pseudoHighlighted, setPseudoHighlighted] = useState(false);
  const pseudoInputRef = useRef<HTMLInputElement | null>(null);

  const fallbackStickerId = selectedSticker ?? randomStickerId;
  const previewSrc =
    avatarTab === "draw" && hasDrawn ? drawingDataUrl : getStickerSrc(fallbackStickerId);

  const trimmedPseudo = pseudo.trim();
  const serializedVibes = selectedVibes.join(VIBE_SEPARATOR);
  const trimmedThemeFocus = themeFocus.trim();
  const pseudoTooLong = trimmedPseudo.length > 24;
  const avatarWillBeRandom = !selectedSticker && !(avatarTab === "draw" && hasDrawn);
  const missingRequiredFields = [
    ...(trimmedPseudo.length === 0 ? ["un pseudo"] : []),
    ...(pseudoTooLong ? ["un pseudo plus court (24 caracteres max)"] : []),
  ];
  const canJoin = trimmedPseudo.length > 0 && !pseudoTooLong && !submitting;

  function jumpToPseudo() {
    setPseudoHighlighted(true);
    window.location.hash = "pseudo-field";
    pseudoInputRef.current?.focus();
    pseudoInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setPseudoHighlighted(false), 1800);
  }

  async function handleJoin() {
    const pseudoTrimmed = pseudo.trim();
    if (!pseudoTrimmed || pseudoTooLong) {
      setError("pseudo");
      return;
    }

    setSubmitting(true);
    setError("");

    const avatar_type = avatarTab === "draw" && hasDrawn ? "draw" : "sticker";
    const avatar_value = avatar_type === "draw" ? drawingDataUrl : fallbackStickerId;

    // Optimistic UI: stash the just-joined participant so /wall can render it instantly
    // even before the round trip to Supabase settles.
    try {
      sessionStorage.setItem(
        JUST_JOINED_KEY,
        JSON.stringify({
          pseudo: pseudoTrimmed,
          project_idea: serializedVibes,
          theme_focus: trimmedThemeFocus,
          avatar_type,
          avatar_value,
        })
      );
    } catch {
      // sessionStorage may be unavailable — non-fatal, wall will just fetch fresh
    }

    let response: Response;
    try {
      // Keep the browser on the same origin. The server talks to Supabase so
      // enterprise firewalls never need to allow a direct *.supabase.co call.
      response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pseudo: pseudoTrimmed,
          project_idea: serializedVibes,
          theme_focus: trimmedThemeFocus,
          avatar_type,
          avatar_value,
        }),
      });
    } catch {
      response = new Response(null, { status: 503 });
    }

    if (!response.ok) {
      setSubmitting(false);
      try {
        sessionStorage.removeItem(JUST_JOINED_KEY);
      } catch {
        // Ignore sessionStorage failures while rolling back the optimistic flow.
      }
      if (response.status === 409) {
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
        <div className="mt-4 font-display text-[clamp(22px,4vw,30px)] font-extrabold text-ink">
          Confessions a vibe coder - 16/07 - 12h00/13h Forum RDC
        </div>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,620px)_minmax(260px,1fr)] lg:gap-12">
          <div>
            <div id="pseudo-field" className="font-display font-bold text-xl text-ink mb-3">
              1. TON PSEUDO <span className="text-[#E8543E]">*</span>
            </div>
            <input
              ref={pseudoInputRef}
              type="text"
              value={pseudo}
              onChange={(e) => {
                setPseudo(e.target.value);
                setError("");
                setPseudoHighlighted(false);
              }}
              placeholder="Ton pseudo"
              maxLength={24}
              className="w-full box-border rounded-2xl bg-white pl-6 pr-4.5 py-4 font-body text-base font-medium outline-none transition focus:border-sh-purple"
              style={{
                border: `2px solid ${
                  error === "pseudo" || error === "duplicate" || pseudoHighlighted ? "#E8543E" : "#E5DFD3"
                }`,
                boxShadow: pseudoHighlighted ? "0 0 0 5px rgba(232, 84, 62, 0.18)" : "none",
              }}
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
                onClick={() => {
                  setAvatarTab("sticker");
                  setError("");
                }}
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
                onClick={() => {
                  setAvatarTab("draw");
                  setError("");
                }}
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
              </>
            )}
            <div className="mt-3 font-body text-sm font-semibold text-ink/70">
              {avatarWillBeRandom
                ? "Pas d’avatar choisi ? On t’en attribue un au hasard."
                : "Ton avatar est prêt."}
            </div>

            <div className="mt-7 rounded-[26px] bg-white/60 p-4 sm:p-5" style={{ border: "2px solid #E5DFD3" }}>
              <div className="mb-2 font-display text-xl font-bold text-ink">3. TA VIBE</div>
              <div className="mb-3 font-body text-sm font-semibold text-ink">
                Optionnel. Tu peux en choisir plusieurs.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {VIBE_OPTIONS.map((option) => {
                  const isSelected = selectedVibes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelectedVibes((current) =>
                          current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
                        );
                        setError("");
                      }}
                      className="rounded-2xl px-4 py-3 text-left font-body text-sm font-semibold transition"
                      style={
                        isSelected
                          ? { background: "#1A1A1A", color: "#ffffff", border: "2px solid #1A1A1A" }
                          : { background: "#ffffff", color: "#1A1A1A", border: "2px solid #E5DFD3" }
                      }
                      aria-pressed={isSelected}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {selectedVibes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVibes([]);
                    setError("");
                  }}
                  className="mt-3 rounded-full bg-white px-3 py-1.5 font-body text-xs font-semibold text-ink/65"
                >
                  Effacer mes choix
                </button>
              )}
              <label className="mt-4 block">
                <div className="mb-2 font-body text-sm font-semibold text-ink">
                  Un petit mot en plus ? Optionnel aussi.
                </div>
                <textarea
                  value={themeFocus}
                  onChange={(e) => {
                    setThemeFocus(e.target.value);
                    setError("");
                  }}
                  placeholder="Une idee, une confession, un cri du coeur..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border-2 border-[#E5DFD3] bg-white px-4 py-3 font-body text-sm font-medium text-ink outline-none transition"
                />
              </label>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={handleJoin}
                disabled={!canJoin}
                className="flex w-full items-center justify-center gap-3 rounded-full border-none px-8 py-5 font-display text-xl font-bold tracking-wide transition-colors duration-150 disabled:translate-y-0"
                style={
                  canJoin
                    ? { background: "#1A1A1A", color: "#fff", cursor: "pointer" }
                    : { background: "#E5DFD3", color: "#9C9585", cursor: "not-allowed" }
                }
                onMouseEnter={(event) => {
                  if (!canJoin) return;
                  event.currentTarget.style.background = "#FFD93D";
                  event.currentTarget.style.color = "#1A1A1A";
                }}
                onMouseLeave={(event) => {
                  if (!canJoin) return;
                  event.currentTarget.style.background = "#1A1A1A";
                  event.currentTarget.style.color = "#ffffff";
                }}
              >
                {submitting ? "ÇA PART EN SALLE..." : "REJOINDRE LA SALLE"} <span>→</span>
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <div
                  className={`rounded-full px-3 py-2 font-body text-sm font-semibold ${
                    trimmedPseudo.length > 0 && !pseudoTooLong
                      ? "bg-[#E7F8EF] text-[#1C7A4D]"
                      : "bg-[#FFF1EC] text-[#B4492D]"
                  }`}
                >
                  {trimmedPseudo.length > 0 && !pseudoTooLong ? "Pseudo OK" : "Pseudo requis"}
                </div>
                <div className="rounded-full bg-[#FFF8D9] px-3 py-2 font-body text-sm font-semibold text-[#8A6400]">
                  {avatarWillBeRandom ? "Avatar aleatoire si besoin" : "Avatar choisi"}
                </div>
              </div>
              {!canJoin && !submitting && missingRequiredFields.length > 0 && (
                <div className="mt-3 rounded-2xl bg-[#FFF1EC] px-4 py-3 font-body text-sm font-semibold text-[#B4492D]">
                  Complète encore {missingRequiredFields.join(" et ")} pour pouvoir rejoindre la salle.
                  {missingRequiredFields.includes("un pseudo") && (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={jumpToPseudo}
                        className="font-extrabold underline underline-offset-2"
                      >
                        Aller au pseudo
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <AvatarPreview src={previewSrc} />
        </div>
      </div>
    </div>
  );
}
