// Predefined sticker avatars. `avatar_value` for avatar_type "sticker" is one of these ids.
// Each sticker is generated as a tiny inline SVG (shape + simple cartoon face) so no
// image assets are needed for the MVP.

export type StickerShape =
  | "circle"
  | "blob"
  | "star"
  | "burst"
  | "triangle"
  | "diamond"
  | "heart"
  | "hexagon"
  | "square"
  | "drop"
  | "lightning"
  | "flower";

export interface StickerDef {
  id: string;
  shape: StickerShape;
  color: string;
}

export const STICKER_DEFS: StickerDef[] = [
  { id: "s1", shape: "circle", color: "#FFD93D" },
  { id: "s2", shape: "flower", color: "#FF6FA5" },
  { id: "s3", shape: "burst", color: "#3ECF8E" },
  { id: "s4", shape: "circle", color: "#8A7CFB" },
  { id: "s5", shape: "heart", color: "#FF7A45" },
  { id: "s6", shape: "star", color: "#3E6CF4" },
  { id: "s7", shape: "lightning", color: "#FFD93D" },
  { id: "s8", shape: "blob", color: "#3E6CF4" },
  { id: "s9", shape: "triangle", color: "#FF6FA5" },
  { id: "s10", shape: "square", color: "#3ECF8E" },
  { id: "s11", shape: "hexagon", color: "#8A7CFB" },
  { id: "s12", shape: "drop", color: "#FF7A45" },
];

function starPoints(cx: number, cy: number, outerR: number, innerR: number, points: number) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function shapeMarkup(shape: StickerShape, color: string): string {
  switch (shape) {
    case "circle":
      return `<circle cx="50" cy="50" r="46" fill="${color}"/>`;
    case "blob":
      return `<path d="M50 6C72 4 94 22 95 46C96 70 76 94 50 95C24 96 5 74 5 49C5 25 28 8 50 6Z" fill="${color}"/>`;
    case "star":
      return `<polygon points="${starPoints(50, 50, 46, 20, 5)}" fill="${color}"/>`;
    case "burst":
      return `<polygon points="${starPoints(50, 50, 46, 34, 12)}" fill="${color}"/>`;
    case "triangle":
      return `<polygon points="50,6 94,90 6,90" fill="${color}"/>`;
    case "diamond":
      return `<polygon points="50,4 94,50 50,96 6,50" fill="${color}"/>`;
    case "heart":
      return `<path d="M50 90C50 90 8 62 8 32C8 16 20 6 34 6C44 6 50 14 50 22C50 14 56 6 66 6C80 6 92 16 92 32C92 62 50 90 50 90Z" fill="${color}"/>`;
    case "hexagon":
      return `<polygon points="50,4 90,26 90,74 50,96 10,74 10,26" fill="${color}"/>`;
    case "square":
      return `<rect x="8" y="8" width="84" height="84" rx="26" fill="${color}"/>`;
    case "drop":
      return `<path d="M50 4C70 34 90 56 90 74C90 88 72 96 50 96C28 96 10 88 10 74C10 56 30 34 50 4Z" fill="${color}"/>`;
    case "lightning":
      return `<polygon points="58,4 26,54 44,54 38,96 76,40 56,40" fill="${color}"/>`;
    case "flower": {
      const angles = [0, 72, 144, 216, 288];
      const petals = angles
        .map((a) => {
          const rad = (a * Math.PI) / 180;
          const cx = (50 + 26 * Math.cos(rad)).toFixed(1);
          const cy = (50 + 26 * Math.sin(rad)).toFixed(1);
          return `<circle cx="${cx}" cy="${cy}" r="24" fill="${color}"/>`;
        })
        .join("");
      return `${petals}<circle cx="50" cy="50" r="22" fill="${color}"/>`;
    }
    default:
      return `<circle cx="50" cy="50" r="46" fill="${color}"/>`;
  }
}

const FACE =
  '<circle cx="36" cy="48" r="7" fill="#fff"/><circle cx="38" cy="49" r="3.2" fill="#161616"/>' +
  '<circle cx="64" cy="48" r="7" fill="#fff"/><circle cx="62" cy="49" r="3.2" fill="#161616"/>' +
  '<path d="M38 66 Q50 78 62 66" stroke="#161616" stroke-width="4.5" fill="none" stroke-linecap="round"/>';

export function buildStickerSvg(shape: StickerShape, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${shapeMarkup(shape, color)}${FACE}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const cache: Record<string, string> = {};
STICKER_DEFS.forEach((d) => {
  cache[d.id] = buildStickerSvg(d.shape, d.color);
});

/** Look up the (cached) data-URI image for a sticker id, or the drawn PNG data-URI if not a known sticker id. */
export function getAvatarSrc(avatarType: "sticker" | "draw", avatarValue: string): string {
  if (avatarType === "sticker") return cache[avatarValue] || cache[STICKER_DEFS[0].id];
  return avatarValue;
}

export function getStickerSrc(id: string): string {
  return cache[id] || cache[STICKER_DEFS[0].id];
}
