"use client";

import { MouseEvent, PointerEvent, useEffect, useRef, useState } from "react";

const IMAGE_WIDTH = 1448;
const IMAGE_HEIGHT = 1086;

const histones = [
  { chain: "A", name: "H3", direction: "down" },
  { chain: "B", name: "H4", direction: "down" },
  { chain: "C", name: "H2A", direction: "down" },
  { chain: "D", name: "H2B", direction: "down" },
  { chain: "E", name: "H3", direction: "up" },
  { chain: "F", name: "H4", direction: "up" },
  { chain: "G", name: "H2A", direction: "up" },
  { chain: "H", name: "H2B", direction: "up" },
] as const;

type Histone = (typeof histones)[number];

export default function InteractiveImage() {
  const [hoveredHistone, setHoveredHistone] = useState<Histone | null>(null);
  const [selectedHistone, setSelectedHistone] = useState<Histone | null>(null);
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

  function histoneAtPosition(clientX: number, clientY: number, target: HTMLElement) {
    const bounds = target.getBoundingClientRect();
    const localX = clientX - bounds.left;
    const localY = clientY - bounds.top;
    const normalizedX = localX / bounds.width;
    const normalizedY = localY / bounds.height;

    if (normalizedX > 0.6 && normalizedX < 0.86 && normalizedY > 0.11 && normalizedY < 0.55) {
      return null;
    }

    const pixelX = Math.max(0, Math.min(IMAGE_WIDTH - 1, Math.floor(normalizedX * IMAGE_WIDTH)));
    const pixelY = Math.max(0, Math.min(IMAGE_HEIGHT - 1, Math.floor(normalizedY * IMAGE_HEIGHT)));

    let strongest: { histone: Histone; alpha: number } | null = null;
    for (const mask of masksRef.current) {
      const alpha = mask.context.getImageData(pixelX, pixelY, 1, 1).data[3];
      if (alpha > (strongest?.alpha ?? 12)) strongest = { histone: mask.histone, alpha };
    }

    return strongest?.histone ?? null;
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${event.clientX - bounds.left}px, ${event.clientY - bounds.top}px, 0) translate(-50%, -50%)`;
    }

    const histone = histoneAtPosition(event.clientX, event.clientY, event.currentTarget);
    setHoveredHistone((current) => (current?.chain === histone?.chain ? current : histone));
  }

  function handleClick(event: MouseEvent<HTMLSpanElement>) {
    const histone = histoneAtPosition(event.clientX, event.clientY, event.currentTarget);
    setSelectedHistone(histone);
  }

  const caption = selectedHistone
    ? `${selectedHistone.name} 组蛋白 · 链 ${selectedHistone.chain} 已抽出；点击空白处归位`
    : hoveredHistone
      ? `点击抽出 ${hoveredHistone.name} 组蛋白 · 链 ${hoveredHistone.chain}`
      : "移动四叶印并点击组蛋白；点击空白处归位";

  return (
    <figure className="interactive-figure">
      <span
        className="interactive-figure-stage"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredHistone(null)}
        onClick={handleClick}
        aria-label="点击一条组蛋白，将它抽出并恢复彩色"
      >
        <img
          src="/interactive-nucleosome.png"
          alt="彩色纳西妲坐在黑白核小体 DNA 上的插画"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
        {histones.map((histone) => {
          const isSelected = selectedHistone?.chain === histone.chain;
          return (
            <span key={histone.chain}>
              <img
                className={`histone-background-layer${isSelected ? " is-visible" : ""}`}
                src={`/histone-overlays/chain-background-${histone.chain}.png`}
                alt=""
                aria-hidden="true"
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
              />
              <img
                className={`histone-color-layer extract-${histone.direction}${isSelected ? " is-selected" : ""}`}
                src={`/histone-overlays/chain-full-${histone.chain}.png`}
                alt=""
                aria-hidden="true"
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
              />
            </span>
          );
        })}
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
      <figcaption className="interactive-figure-caption">{caption}</figcaption>
    </figure>
  );
}
