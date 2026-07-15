import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseClient";
import type { AvatarType } from "@/lib/types";

interface ParticipantInput {
  pseudo?: unknown;
  project_idea?: unknown;
  theme_focus?: unknown;
  avatar_type?: unknown;
  avatar_value?: unknown;
}

export async function POST(request: Request) {
  let input: ParticipantInput;

  try {
    input = (await request.json()) as ParticipantInput;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const pseudo = typeof input.pseudo === "string" ? input.pseudo.trim() : "";
  const projectIdea = typeof input.project_idea === "string" ? input.project_idea : "";
  const themeFocus = typeof input.theme_focus === "string" ? input.theme_focus.trim() : "";
  const avatarType: AvatarType | null =
    input.avatar_type === "sticker" || input.avatar_type === "draw" ? input.avatar_type : null;
  const avatarValue = typeof input.avatar_value === "string" ? input.avatar_value : "";

  if (!pseudo || pseudo.length > 24 || !avatarType || !avatarValue) {
    return NextResponse.json({ error: "invalid_participant" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "server_configuration" }, { status: 503 });
  }

  const { error } = await supabase.from("participants").insert({
    pseudo,
    project_idea: projectIdea,
    theme_focus: themeFocus,
    avatar_type: avatarType,
    avatar_value: avatarValue,
  });

  if (error?.code === "23505") {
    return NextResponse.json({ error: "duplicate_pseudo" }, { status: 409 });
  }

  if (error) {
    return NextResponse.json({ error: "database_error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
