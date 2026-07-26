"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";

const IMAGE_WIDTH = 1448;
const IMAGE_HEIGHT = 1086;

const histones = [
  { chain: "A", name: "H3" },
  { chain: "B", name: "H4" },
  { chain: "C", name: "H2A" },
  { chain: "D", name: "H2B" },
  { chain: "E", name: "H3" },
  { chain: "F", name: "H4" },
  { chain: "G", name: "H2A" },
  { chain: "H", name: "H2B" },
] as const;

type Histone = (typeof histones)[number];

export default function InteractiveImage() {
  const [motionKey, setMotionKey] = useState(0);
  const [activeHistone, setActiveHistone] = useState<Histone | null>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const masksRef = useRef<Array<{ histone: Histone; context: CanvasRenderingContext2D }>>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      histones.map(
        (histone) =>
          new Promise<{ histone: Histone; context: CanvasRenderingContext2D }>((resolve) => {
            const image = new Image();
            image.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = IMAGE_WIDTH;
              canvas.height = IMAGE_HEIGHT;
              const context = canvas.getContext("2d", { willReadFrequently: true });
              if (!context) return;
              context.drawImage(image, 0, 0);
              resolve({ histone, context });
            };
            image.src = `/histone-overlays/chain-${histone.chain}.png`;
          }),
      ),
    ).then((masks) => {
      if (!cancelled) masksRef.current = masks;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${localX}px, ${localY}px, 0) translate(-50%, -50%)`;
    }

    const normalizedX = localX / bounds.width;
    const normalizedY = localY / bounds.height;

    // Nahida sits in front of the molecular model, so the histones behind her
    // should not respond through her silhouette.
    if (normalizedX > 0.6 && normalizedX < 0.86 && normalizedY > 0.11 && normalizedY < 0.55) {
      setActiveHistone(null);
      return;
    }

    const pixelX = Math.max(0, Math.min(IMAGE_WIDTH - 1, Math.floor(normalizedX * IMAGE_WIDTH)));
    const pixelY = Math.max(0, Math.min(IMAGE_HEIGHT - 1, Math.floor(normalizedY * IMAGE_HEIGHT)));

    let strongest: { histone: Histone; alpha: number } | null = null;
    for (const mask of masksRef.current) {
      const alpha = mask.context.getImageData(pixelX, pixelY, 1, 1).data[3];
      if (alpha > (strongest?.alpha ?? 12)) strongest = { histone: mask.histone, alpha };
    }

    setActiveHistone((current) =>
      current?.chain === strongest?.histone.chain ? current : strongest?.histone ?? null,
    );
  }

  return (
    <button
      type="button"
      className="interactive-figure"
      onClick={() => setMotionKey((current) => current + 1)}
      aria-label="用四叶印查看彩色组蛋白，点击让核小体动一下"
    >
      <span
        key={motionKey}
        className={motionKey > 0 ? "interactive-figure-motion" : undefined}
      >
        <span
          className="interactive-figure-stage"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActiveHistone(null)}
        >
          <img
            src="/interactive-nucleosome.png"
            alt="彩色纳西妲坐在黑白核小体 DNA 上的插画"
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
          />
          {activeHistone ? (
            <img
              className="histone-color-layer"
              src={`/histone-overlays/chain-${activeHistone.chain}.png`}
              alt=""
              aria-hidden="true"
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
            />
          ) : null}
          <img
            className="nahida-foreground-guard"
            src="/interactive-nucleosome.png"
            alt=""
            aria-hidden="true"
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
          />
          <span ref={cursorRef} className="nahida-cursor" aria-hidden="true" />
        </span>
      </span>
      <span className="interactive-figure-caption">
        {activeHistone
          ? `${activeHistone.name} 组蛋白 · 链 ${activeHistone.chain}`
          : "移动四叶印查看组蛋白，点击图片让它动一下"}
      </span>
    </button>
  );
}
