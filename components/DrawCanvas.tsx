"use client";

import { useEffect, useRef, useState } from "react";
import eyesClassic from "@/components/assets/picto_01.png";
import eyesSparkle from "@/components/assets/picto_07.png";
import eyesSpiral from "@/components/assets/picto_05.png";
import mouthSmile from "@/components/assets/picto_13.png";
import mouthLips from "@/components/assets/picto_14.png";
import mouthTongue from "@/components/assets/picto_16.png";
import hairBrown from "@/components/assets/pictos2/picto_01.png";
import hairBlonde from "@/components/assets/pictos2/picto_02.png";
import hairAfro from "@/components/assets/pictos2/picto_03.png";
import hairBuns from "@/components/assets/pictos2/picto_04.png";

const DRAW_COLORS = ["#1A1A1A", "#8A7CFB", "#FF6FA5", "#3E6CF4", "#3ECF8E", "#FF7A45"];

type StampId =
  | "hairBrown"
  | "hairBlonde"
  | "hairAfro"
  | "hairBuns"
  | "eyesClassic"
  | "eyesSparkle"
  | "eyesSpiral"
  | "nose"
  | "mouthSmile"
  | "mouthLips"
  | "mouthTongue"
  | "blush";
type ToolMode = "draw" | StampId;

interface DrawCanvasProps {
  /** Called with a PNG data-URI every time the drawing changes, or "" when cleared. */
  onChange: (dataUrl: string, hasDrawn: boolean) => void;
}

const STAMP_BUTTONS: Array<{ id: StampId; label: string; preview: string; imageSrc?: string; size?: number }> = [
  { id: "hairBrown", label: "Cheveux bruns", preview: "🟤", imageSrc: hairBrown.src, size: 116 },
  { id: "hairBlonde", label: "Cheveux blonds", preview: "🟡", imageSrc: hairBlonde.src, size: 116 },
  { id: "hairAfro", label: "Afro", preview: "⚫", imageSrc: hairAfro.src, size: 112 },
  { id: "hairBuns", label: "Couettes", preview: "🎀", imageSrc: hairBuns.src, size: 118 },
  { id: "eyesClassic", label: "Yeux pop", preview: "👀", imageSrc: eyesClassic.src, size: 84 },
  { id: "eyesSparkle", label: "Yeux star", preview: "✨", imageSrc: eyesSparkle.src, size: 84 },
  { id: "eyesSpiral", label: "Yeux spiral", preview: "🌀", imageSrc: eyesSpiral.src, size: 84 },
  { id: "nose", label: "Nez", preview: "◡", size: 36 },
  { id: "mouthSmile", label: "Sourire", preview: "😄", imageSrc: mouthSmile.src, size: 72 },
  { id: "mouthLips", label: "Lèvres", preview: "💋", imageSrc: mouthLips.src, size: 70 },
  { id: "mouthTongue", label: "Langue", preview: "😛", imageSrc: mouthTongue.src, size: 74 },
  { id: "blush", label: "Joues", preview: "◍", size: 42 },
];

export default function DrawCanvas({ onChange }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const isDrawing = useRef(false);
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [toolMode, setToolMode] = useState<ToolMode>("draw");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function emitChange() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"), true);
  }

  function getStampMeta(stampId: StampId) {
    return STAMP_BUTTONS.find((stamp) => stamp.id === stampId);
  }

  function drawImageStamp(ctx: CanvasRenderingContext2D, src: string, x: number, y: number, size: number) {
    const cached = imageCacheRef.current[src];

    if (cached?.complete) {
      ctx.drawImage(cached, x - size / 2, y - size / 2, size, size);
      emitChange();
      return;
    }

    const img = cached || new Image();
    img.src = src;
    imageCacheRef.current[src] = img;
    img.onload = () => {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      emitChange();
    };
  }

  function placeStamp(ctx: CanvasRenderingContext2D, x: number, y: number, stampId: StampId) {
    const stampMeta = getStampMeta(stampId);
    if (stampMeta?.imageSrc && stampMeta.size) {
      drawImageStamp(ctx, stampMeta.imageSrc, x, y, stampMeta.size);
      return;
    }

    ctx.save();

    if (stampId === "nose") {
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 6);
      ctx.quadraticCurveTo(x + 8, y - 2, x, y + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 10);
      ctx.quadraticCurveTo(x, y + 14, x + 6, y + 9);
      ctx.stroke();
    }

    if (stampId === "blush") {
      ctx.fillStyle = "rgba(255, 111, 165, 0.85)";
      ctx.beginPath();
      ctx.arc(x - 18, y, 10, 0, Math.PI * 2);
      ctx.arc(x + 18, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getPoint(e);

    if (toolMode !== "draw") {
      placeStamp(ctx, p.x, p.y, toolMode);
      emitChange();
      return;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    isDrawing.current = true;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || toolMode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    emitChange();
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange("", false);
  }

  return (
    <div className="rounded-3xl bg-[#F1EEE6] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setToolMode("draw")}
          className="rounded-full px-3 py-1.5 font-body text-xs font-semibold transition"
          style={
            toolMode === "draw"
              ? { background: "#1A1A1A", color: "#ffffff" }
              : { background: "#ffffff", color: "#1A1A1A", border: "2px solid #E5DFD3" }
          }
        >
          Crayon
        </button>
        {STAMP_BUTTONS.map((stamp) => {
          const isSelected = toolMode === stamp.id;
          return (
            <button
              key={stamp.id}
              type="button"
              onClick={() => setToolMode(stamp.id)}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 font-body text-xs font-semibold transition"
              style={
                isSelected
                  ? { background: "#8A7CFB", color: "#ffffff" }
                  : { background: "#ffffff", color: "#1A1A1A", border: "2px solid #E5DFD3" }
              }
            >
              {stamp.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stamp.imageSrc} alt="" className="h-6 w-6 object-contain" />
              ) : (
                <span aria-hidden="true">{stamp.preview}</span>
              )}
              <span>{stamp.label}</span>
            </button>
          );
        })}
      </div>

      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="mx-auto mb-3.5 block aspect-square w-full max-w-[280px] touch-none rounded-2xl bg-white shadow-[0_2px_0_rgba(0,0,0,0.08)]"
      />

      <div className="mb-3 text-center font-body text-xs font-semibold text-ink/60">
        {toolMode === "draw"
          ? "Dessine librement ou passe en mode stickers pour composer un visage."
          : "Clique sur le canvas pour poser ton sticker visage."}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {DRAW_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Choisir la couleur ${c}`}
            onClick={() => {
              setColor(c);
              setToolMode("draw");
            }}
            className="h-7 w-7 rounded-full box-border transition-transform duration-150 hover:scale-105"
            style={{ background: c, border: `3px solid ${c === color ? "#1A1A1A" : "#ffffff"}` }}
          />
        ))}
        <button
          type="button"
          onClick={clear}
          className="ml-2 cursor-pointer rounded-xl border-2 border-[#E5DFD3] bg-white px-3.5 py-1.5 font-body text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5"
        >
          Effacer
        </button>
      </div>
    </div>
  );
}
