export type AvatarType = "sticker" | "draw";

export interface Participant {
  id: string;
  pseudo: string;
  project_idea: string;
  theme_focus: string;
  avatar_type: AvatarType;
  avatar_value: string;
  created_at: string;
}
