"use client";

import { useEffect, useRef } from "react";

type MusicConfig = {
  platform: string;
  type: string;
  playlistId: string;
  shareUrl: string;
  order: string;
  autoplay: boolean;
};

const APLAYER_STYLE = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css";
const APLAYER_SCRIPT = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js";
const METING_SCRIPT = "https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js";

function loadStyle() {
  if (document.querySelector(`link[href="${APLAYER_STYLE}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = APLAYER_STYLE;
  document.head.appendChild(link);
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), { once: true });
    document.body.appendChild(script);
  });
}

export default function MusicPlayer({ config }: { config: MusicConfig }) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    loadStyle();
    const player = document.createElement("meting-js");
    player.setAttribute("server", config.platform);
    player.setAttribute("type", config.type);
    player.setAttribute("id", config.playlistId);
    player.setAttribute("fixed", "true");
    player.setAttribute("mini", "true");
    player.setAttribute("autoplay", String(config.autoplay));
    player.setAttribute("loop", "all");
    player.setAttribute("order", config.order);
    player.setAttribute("preload", "metadata");
    player.setAttribute("mutex", "true");
    player.setAttribute("list-folded", "true");
    container.prepend(player);

    loadScript(APLAYER_SCRIPT)
      .then(() => loadScript(METING_SCRIPT))
      .catch(() => container.classList.add("music-module-unavailable"));

    return () => {
      player.remove();
    };
  }, [config]);

  return (
    <aside ref={containerRef} className="music-module" aria-label="QQ 音乐随机歌单">
      <a className="music-module-fallback" href={config.shareUrl} target="_blank" rel="noreferrer">
        QQ 音乐歌单
      </a>
    </aside>
  );
}
