"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const CANVAS_SIZE = 320;
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
  onChange: (dataUrl: string, hasDrawn: boolean) => void;
}

interface StampButton {
  id: StampId;
  label: string;
  preview: string;
  imageSrc: string;
  defaultWidth: number;
}

interface PlacedSticker {
  id: string;
  stampId: StampId;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

function makeSvgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const NOSE_SRC = makeSvgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M17 9C20 18 24 24 29 31" stroke="#111111" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M16 33C21 38 28 38 33 33" stroke="#111111" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>
`);

const BLUSH_SRC = makeSvgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 40">
    <circle cx="20" cy="20" r="14" fill="#FF6FA5" fill-opacity="0.85"/>
    <circle cx="68" cy="20" r="14" fill="#FF6FA5" fill-opacity="0.85"/>
  </svg>
`);

const STAMP_BUTTONS: StampButton[] = [
  { id: "hairBrown", label: "Cheveux bruns", preview: "🟤", imageSrc: hairBrown.src, defaultWidth: 116 },
  { id: "hairBlonde", label: "Cheveux blonds", preview: "🟡", imageSrc: hairBlonde.src, defaultWidth: 116 },
  { id: "hairAfro", label: "Afro", preview: "⚫", imageSrc: hairAfro.src, defaultWidth: 112 },
  { id: "hairBuns", label: "Couettes", preview: "🎀", imageSrc: hairBuns.src, defaultWidth: 118 },
  { id: "eyesClassic", label: "Yeux pop", preview: "👀", imageSrc: eyesClassic.src, defaultWidth: 84 },
  { id: "eyesSparkle", label: "Yeux star", preview: "✨", imageSrc: eyesSparkle.src, defaultWidth: 84 },
  { id: "eyesSpiral", label: "Yeux spiral", preview: "🌀", imageSrc: eyesSpiral.src, defaultWidth: 84 },
  { id: "nose", label: "Nez", preview: "◡", imageSrc: NOSE_SRC, defaultWidth: 34 },
  { id: "mouthSmile", label: "Sourire", preview: "😄", imageSrc: mouthSmile.src, defaultWidth: 74 },
  { id: "mouthLips", label: "Lèvres", preview: "💋", imageSrc: mouthLips.src, defaultWidth: 70 },
  { id: "mouthTongue", label: "Langue", preview: "😛", imageSrc: mouthTongue.src, defaultWidth: 74 },
  { id: "blush", label: "Joues", preview: "◍", imageSrc: BLUSH_SRC, defaultWidth: 56 },
];

export default function DrawCanvas({ onChange }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const isDrawing = useRef(false);
  const hasStrokeRef = useRef(false);
  const dragStateRef = useRef<DragState | null>(null);

  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [toolMode, setToolMode] = useState<ToolMode>("draw");
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const stampById = useMemo(
    () => Object.fromEntries(STAMP_BUTTONS.map((stamp) => [stamp.id, stamp])) as Record<StampId, StampButton>,
    []
  );

  const selectedSticker = placedStickers.find((sticker) => sticker.id === selectedStickerId) || null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  const getPointFromClient = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return null;

    const rect = stage.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    return {
      x: clamp((clientX - rect.left) * scaleX, 0, CANVAS_SIZE),
      y: clamp((clientY - rect.top) * scaleY, 0, CANVAS_SIZE),
    };
  }, []);

  function beginStroke(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const point = getPointFromClient(clientX, clientY);
    if (!ctx || !point) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    isDrawing.current = true;
  }

  function continueStroke(clientX: number, clientY: number) {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const point = getPointFromClient(clientX, clientY);
    if (!ctx || !point) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  async function endStroke() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    hasStrokeRef.current = true;
    await mergeAndEmit(placedStickers);
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const cached = imageCacheRef.current[src];
      if (cached?.complete) {
        resolve(cached);
        return;
      }

      const img = cached || new Image();
      imageCacheRef.current[src] = img;
      img.onload = () => resolve(img);
      img.onerror = reject;
      if (!cached) {
        img.src = src;
      }
    });
  }

  const mergeAndEmit = useCallback(async (stickers: PlacedSticker[]) => {
    const baseCanvas = canvasRef.current;
    if (!baseCanvas) return;

    if (!hasStrokeRef.current && stickers.length === 0) {
      onChange("", false);
      return;
    }

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = CANVAS_SIZE;
    exportCanvas.height = CANVAS_SIZE;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    exportCtx.drawImage(baseCanvas, 0, 0);

    for (const sticker of stickers) {
      const stamp = stampById[sticker.stampId];
      const img = await loadImage(stamp.imageSrc);
      exportCtx.drawImage(
        img,
        sticker.x - sticker.width / 2,
        sticker.y - sticker.height / 2,
        sticker.width,
        sticker.height
      );
    }

    onChange(exportCanvas.toDataURL("image/png"), true);
  }, [onChange, stampById]);

  useEffect(() => {
    void mergeAndEmit(placedStickers);
  }, [mergeAndEmit, placedStickers]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const point = getPointFromClient(event.clientX, event.clientY);
      if (!point) return;

      setPlacedStickers((current) =>
        current.map((sticker) =>
          sticker.id === dragState.id
            ? {
                ...sticker,
                x: clamp(point.x - dragState.offsetX, sticker.width / 2, CANVAS_SIZE - sticker.width / 2),
                y: clamp(point.y - dragState.offsetY, sticker.height / 2, CANVAS_SIZE - sticker.height / 2),
              }
            : sticker
        )
      );
    }

    function handlePointerUp() {
      dragStateRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [getPointFromClient]);

  async function placeSticker(clientX: number, clientY: number, stampId: StampId) {
    const stamp = stampById[stampId];
    const img = await loadImage(stamp.imageSrc);
    const point = getPointFromClient(clientX, clientY);
    if (!point) return;

    const aspectRatio = img.naturalHeight / img.naturalWidth || 1;
    const width = stamp.defaultWidth;
    const height = Math.max(24, width * aspectRatio);

    const newSticker: PlacedSticker = {
      id: `${stampId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      stampId,
      x: clamp(point.x, width / 2, CANVAS_SIZE - width / 2),
      y: clamp(point.y, height / 2, CANVAS_SIZE - height / 2),
      width,
      height,
    };

    setPlacedStickers((current) => [...current, newSticker]);
    setSelectedStickerId(newSticker.id);
  }

  function handleStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;

    setSelectedStickerId(null);

    if (toolMode === "draw") {
      event.currentTarget.setPointerCapture(event.pointerId);
      beginStroke(event.clientX, event.clientY);
      return;
    }

    void placeSticker(event.clientX, event.clientY, toolMode);
  }

  function handleStagePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    continueStroke(event.clientX, event.clientY);
  }

  function handleStagePointerUp() {
    void endStroke();
  }

  function handleStickerPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    sticker: PlacedSticker
  ) {
    event.stopPropagation();
    setSelectedStickerId(sticker.id);

    const point = getPointFromClient(event.clientX, event.clientY);
    if (!point) return;

    dragStateRef.current = {
      id: sticker.id,
      offsetX: point.x - sticker.x,
      offsetY: point.y - sticker.y,
    };
  }

  function handleResizeSticker(nextWidth: number) {
    if (!selectedSticker) return;

    const aspectRatio = selectedSticker.height / selectedSticker.width;
    const clampedWidth = clamp(nextWidth, 28, 170);
    const nextHeight = clampedWidth * aspectRatio;

    setPlacedStickers((current) =>
      current.map((sticker) =>
        sticker.id === selectedSticker.id
          ? {
              ...sticker,
              width: clampedWidth,
              height: nextHeight,
              x: clamp(sticker.x, clampedWidth / 2, CANVAS_SIZE - clampedWidth / 2),
              y: clamp(sticker.y, nextHeight / 2, CANVAS_SIZE - nextHeight / 2),
            }
          : sticker
      )
    );
  }

  function deleteSelectedSticker() {
    if (!selectedStickerId) return;

    setPlacedStickers((current) => current.filter((sticker) => sticker.id !== selectedStickerId));
    setSelectedStickerId(null);
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasStrokeRef.current = false;
    setPlacedStickers([]);
    setSelectedStickerId(null);
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stamp.imageSrc}
                alt=""
                className="h-6 w-auto max-w-[34px] object-contain"
              />
              <span>{stamp.label}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerLeave={handleStagePointerUp}
        className="mx-auto mb-3.5 block aspect-square w-full max-w-[280px] touch-none rounded-2xl bg-white shadow-[0_2px_0_rgba(0,0,0,0.08)] relative overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />

        {placedStickers.map((sticker) => {
          const stamp = stampById[sticker.stampId];
          const isSelected = sticker.id === selectedStickerId;

          return (
            <button
              key={sticker.id}
              type="button"
              onPointerDown={(event) => handleStickerPointerDown(event, sticker)}
              className={`absolute flex items-center justify-center rounded-xl ${isSelected ? "ring-2 ring-sh-purple ring-offset-2" : ""}`}
              style={{
                left: `${((sticker.x - sticker.width / 2) / CANVAS_SIZE) * 100}%`,
                top: `${((sticker.y - sticker.height / 2) / CANVAS_SIZE) * 100}%`,
                width: `${(sticker.width / CANVAS_SIZE) * 100}%`,
                height: `${(sticker.height / CANVAS_SIZE) * 100}%`,
              }}
              aria-label={`Sticker ${stamp.label}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stamp.imageSrc} alt="" className="h-full w-full object-contain pointer-events-none" />
            </button>
          );
        })}
      </div>

      <div className="mb-3 text-center font-body text-xs font-semibold text-ink/60">
        {toolMode === "draw"
          ? "Dessine librement. Clique ensuite sur un sticker pour le placer sur la zone blanche."
          : "Clique pour poser ton sticker, puis fais-le glisser, redimensionne-le ou supprime-le."}
      </div>

      {selectedSticker && (
        <div className="mb-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_0_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div className="font-body text-sm font-semibold text-ink">Sticker selectionne</div>
            <button
              type="button"
              onClick={deleteSelectedSticker}
              className="rounded-full bg-[#FFE3EA] px-3 py-1.5 font-body text-xs font-semibold text-[#C13B65]"
            >
              Supprimer
            </button>
          </div>
          <label className="mt-3 block">
            <div className="mb-2 font-body text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Taille
            </div>
            <input
              type="range"
              min={28}
              max={170}
              value={Math.round(selectedSticker.width)}
              onChange={(event) => handleResizeSticker(Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {DRAW_COLORS.map((drawColor) => (
          <button
            key={drawColor}
            type="button"
            aria-label={`Choisir la couleur ${drawColor}`}
            onClick={() => {
              setColor(drawColor);
              setToolMode("draw");
            }}
            className="h-7 w-7 rounded-full box-border transition-transform duration-150 hover:scale-105"
            style={{ background: drawColor, border: `3px solid ${drawColor === color ? "#1A1A1A" : "#ffffff"}` }}
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
