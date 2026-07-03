"use client";

import { useRef, useState, useEffect } from "react";

const DRAW_COLORS = ["#1A1A1A", "#8A7CFB", "#FF6FA5", "#3E6CF4", "#3ECF8E", "#FF7A45"];

interface DrawCanvasProps {
  /** Called with a PNG data-URI every time the drawing changes, or "" when cleared. */
  onChange: (dataUrl: string, hasDrawn: boolean) => void;
}

export default function DrawCanvas({ onChange }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const [color, setColor] = useState(DRAW_COLORS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getPoint(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    isDrawing.current = true;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"), true);
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
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {DRAW_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Choisir la couleur ${c}`}
            onClick={() => setColor(c)}
            className="h-7 w-7 rounded-full box-border transition-transform duration-150 hover:scale-105"
            style={{ background: c, border: `3px solid ${c === color ? "#1A1A1A" : "#ffffff"}` }}
          />
        ))}
        <button
          type="button"
          onClick={clear}
          className="ml-2 rounded-xl border-2 border-[#E5DFD3] bg-white px-3.5 py-1.5 font-body text-sm font-semibold cursor-pointer transition-transform duration-150 hover:-translate-y-0.5"
        >
          Effacer
        </button>
      </div>
    </div>
  );
}
