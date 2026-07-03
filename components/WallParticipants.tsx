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
    <div className="grid gap-4.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))" }}>
      {participants.map((participant) => (
        <ParticipantCard
          key={participant.id}
          pseudo={participant.pseudo}
          src={getAvatarSrc(participant.avatar_type, participant.avatar_value)}
        />
      ))}
    </div>
  );
}
