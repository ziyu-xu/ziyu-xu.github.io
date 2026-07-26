"use client";

import { MouseEvent, PointerEvent, useEffect, useRef, useState } from "react";

const IMAGE_WIDTH = 1448;
const IMAGE_HEIGHT = 1086;

const histones = [
  { chain: "A", name: "H3", labelX: 74, labelY: 57, color: "#347fbd" },
  { chain: "B", name: "H4", labelX: 68, labelY: 72, color: "#438d58" },
  { chain: "C", name: "H2A", labelX: 25, labelY: 55, color: "#b87816" },
  { chain: "D", name: "H2B", labelX: 24, labelY: 71, color: "#b94f5b" },
  { chain: "E", name: "H3", labelX: 34, labelY: 43, color: "#347fbd" },
  { chain: "F", name: "H4", labelX: 34, labelY: 24, color: "#438d58" },
  { chain: "G", name: "H2A", labelX: 76, labelY: 36, color: "#b87816" },
  { chain: "H", name: "H2B", labelX: 56, labelY: 28, color: "#b94f5b" },
] as const;

type Histone = (typeof histones)[number];

export default function InteractiveImage() {
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

  }

  function handleClick(event: MouseEvent<HTMLSpanElement>) {
    const histone = histoneAtPosition(event.clientX, event.clientY, event.currentTarget);
    setSelectedHistone(histone);
  }

  return (
    <figure className="interactive-figure">
      <span
        className="interactive-figure-stage"
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        aria-label="点击一条组蛋白，在原位显示颜色与名称"
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
                className={`histone-color-layer${isSelected ? " is-selected" : ""}`}
                src={`/histone-overlays/chain-${histone.chain}.png`}
                alt=""
                aria-hidden="true"
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
              />
              {isSelected ? (
                <span
                  className="histone-label"
                  style={{
                    left: `${histone.labelX}%`,
                    top: `${histone.labelY}%`,
                    color: histone.color,
                  }}
                  aria-hidden="true"
                >
                  {histone.name}
                </span>
              ) : null}
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
    </figure>
  );
}
