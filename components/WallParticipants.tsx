"use client";

import { useEffect, useMemo, useState } from "react";
import { getAvatarSrc } from "@/lib/stickers";
import type { Participant } from "@/lib/types";
import ParticipantCard from "@/components/ParticipantCard";

const JUST_JOINED_KEY = "seathappens_just_joined";

interface WallParticipantsProps {
  initialParticipants: Participant[];
}

function normalizePseudo(value: string) {
  return value.trim().toLocaleLowerCase();
}

export default function WallParticipants({ initialParticipants }: WallParticipantsProps) {
  const [optimisticParticipant, setOptimisticParticipant] = useState<Participant | null>(null);
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(JUST_JOINED_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Pick<
        Participant,
        "pseudo" | "project_idea" | "theme_focus" | "avatar_type" | "avatar_value"
      >;
      const alreadyPresent = initialParticipants.some(
        (participant) => normalizePseudo(participant.pseudo) === normalizePseudo(parsed.pseudo)
      );

      if (!alreadyPresent) {
        setOptimisticParticipant({
          id: "optimistic-join",
          pseudo: parsed.pseudo,
          project_idea: parsed.project_idea || "",
          theme_focus: parsed.theme_focus || "",
          avatar_type: parsed.avatar_type,
          avatar_value: parsed.avatar_value,
          created_at: new Date().toISOString(),
        });
      }

      sessionStorage.removeItem(JUST_JOINED_KEY);
    } catch {
      // Ignore malformed storage values and keep the server-rendered list.
    }
  }, [initialParticipants]);

  const participants = useMemo(() => {
    if (!optimisticParticipant) {
      return initialParticipants;
    }

    return [optimisticParticipant, ...initialParticipants];
  }, [initialParticipants, optimisticParticipant]);

  if (participants.length === 0) {
    return (
      <div className="rounded-[32px] border-2 border-white/60 bg-white/40 px-6 py-14 text-center shadow-[0_8px_0_rgba(0,0,0,0.05)]">
        <div className="text-[44px]">🪑</div>
        <div className="mt-3 font-display text-2xl font-bold text-ink">C&apos;est calme par ici...</div>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
          Lance la vibe en premier. Choisis un avatar et remplis la salle de bonnes ondes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:gap-7" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}>
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.id}
            pseudo={participant.pseudo}
            projectIdea={participant.project_idea}
            themeFocus={participant.theme_focus}
            src={getAvatarSrc(participant.avatar_type, participant.avatar_value)}
            onOpen={() => setActiveParticipant(participant)}
          />
        ))}
      </div>

      {activeParticipant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 py-8 backdrop-blur-[2px]"
          onClick={() => setActiveParticipant(null)}
        >
          <div
            className="relative w-full max-w-md rounded-[30px] bg-cream p-6 shadow-[0_14px_0_rgba(0,0,0,0.14)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveParticipant(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-ink"
              aria-label="Fermer"
            >
              ×
            </button>

            <div className="flex items-center gap-4 pr-10">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatarSrc(activeParticipant.avatar_type, activeParticipant.avatar_value)}
                  alt={activeParticipant.pseudo}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-ink">{activeParticipant.pseudo}</div>
                {activeParticipant.project_idea ? (
                  <div className="mt-1 inline-block rounded-full bg-sh-yellow px-3 py-1 font-display text-xs font-bold text-ink">
                    sa vibe
                  </div>
                ) : activeParticipant.theme_focus ? (
                  <div className="mt-1 inline-block rounded-full bg-sh-purple/15 px-3 py-1 font-display text-xs font-bold text-sh-purple">
                    son mot doux
                  </div>
                ) : (
                  <div className="mt-1 inline-block rounded-full bg-white px-3 py-1 font-display text-xs font-bold text-ink/55">
                    pas de vibe partagee
                  </div>
                )}
              </div>
            </div>

            {activeParticipant.project_idea && (
              <div className="mt-5 rounded-[24px] bg-white px-4 py-4 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
                <div className="font-body text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Vote vibe</div>
                <p className="mt-2 font-body text-base font-medium leading-relaxed text-ink">
                  {activeParticipant.project_idea}
                </p>
              </div>
            )}

            {activeParticipant.theme_focus && (
              <div className="mt-4 rounded-[24px] bg-white px-4 py-4 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
                <div className="font-body text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Petit mot libre</div>
                <p className="mt-2 whitespace-pre-line font-body text-base font-medium leading-relaxed text-ink">
                  {activeParticipant.theme_focus}
                </p>
              </div>
            )}

            {!activeParticipant.project_idea && !activeParticipant.theme_focus && (
              <div className="mt-5 rounded-[24px] bg-white px-4 py-4 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
                <div className="font-body text-xs font-bold uppercase tracking-[0.18em] text-ink/45">Mystere total</div>
                <p className="mt-2 font-body text-base font-medium leading-relaxed text-ink">
                  Cette personne a prefere garder un peu de mystere pour l&apos;instant.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
