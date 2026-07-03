"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard may be unavailable (older browsers, insecure context) — fail silently
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex cursor-pointer items-center gap-2 rounded-full border-none bg-white px-6 py-3.5 font-display text-sm font-bold text-ink shadow-[0_4px_0_rgba(0,0,0,0.08)] transition-transform duration-150 hover:-translate-y-0.5"
      aria-live="polite"
    >
      {copied ? <span>✅ Lien copié !</span> : <span>🔗 Partager le lien</span>}
    </button>
  );
}
