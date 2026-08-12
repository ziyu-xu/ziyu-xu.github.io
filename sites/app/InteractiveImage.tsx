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
type DnaSelection = { labelX: number; labelY: number };

export default function InteractiveImage() {
  const [selectedHistone, setSelectedHistone] = useState<Histone | null>(null);
  const [selectedDna, setSelectedDna] = useState<DnaSelection | null>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const masksRef = useRef<Array<{ histone: Histone; context: CanvasRenderingContext2D }>>([]);
  const dnaMaskRef = useRef<CanvasRenderingContext2D | null>(null);

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

    const dnaMask = new Image();
    dnaMask.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = IMAGE_WIDTH;
      canvas.height = IMAGE_HEIGHT;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(dnaMask, 0, 0);
      if (!cancelled) dnaMaskRef.current = context;
    };
    dnaMask.src = "/dna-hit-mask.png";

    return () => {
      cancelled = true;
    };
  }, []);

  function targetAtPosition(clientX: number, clientY: number, target: HTMLElement) {
    const bounds = target.getBoundingClientRect();
    const localX = clientX - bounds.left;
    const localY = clientY - bounds.top;
    const normalizedX = localX / bounds.width;
    const normalizedY = localY / bounds.height;

    if (normalizedX > 0.6 && normalizedX < 0.86 && normalizedY > 0.11 && normalizedY < 0.55) {
      return { kind: "blank" } as const;
    }

    const pixelX = Math.max(0, Math.min(IMAGE_WIDTH - 1, Math.floor(normalizedX * IMAGE_WIDTH)));
    const pixelY = Math.max(0, Math.min(IMAGE_HEIGHT - 1, Math.floor(normalizedY * IMAGE_HEIGHT)));

    const dnaAlpha = dnaMaskRef.current?.getImageData(pixelX, pixelY, 1, 1).data[3] ?? 0;
    if (dnaAlpha > 12) {
      return {
        kind: "dna",
        labelX: Math.max(10, Math.min(90, normalizedX * 100 + 4)),
        labelY: Math.max(10, Math.min(90, normalizedY * 100 - 4)),
      } as const;
    }

    let strongest: { histone: Histone; alpha: number } | null = null;
    for (const mask of masksRef.current) {
      const alpha = mask.context.getImageData(pixelX, pixelY, 1, 1).data[3];
      if (alpha > (strongest?.alpha ?? 12)) strongest = { histone: mask.histone, alpha };
    }

    return strongest
      ? ({ kind: "histone", histone: strongest.histone } as const)
      : ({ kind: "blank" } as const);
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width;
    const normalizedY = (event.clientY - bounds.top) / bounds.height;
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${event.clientX - bounds.left}px, ${event.clientY - bounds.top}px, 0) translate(-50%, -50%)`;
    }

    if (headRef.current) {
      const lookX = Math.max(-4, Math.min(4, (normalizedX - 0.7) * 10));
      const lookY = Math.max(-4, Math.min(4, (normalizedY - 0.22) * 10));
      const angle = Math.max(-6, Math.min(6, (0.22 - normalizedY) * 13));
      headRef.current.style.setProperty("--nahida-look-x", `${lookX}px`);
      headRef.current.style.setProperty("--nahida-look-y", `${lookY}px`);
      headRef.current.style.setProperty("--nahida-look-angle", `${angle}deg`);
    }
  }

  function handlePointerLeave() {
    if (!headRef.current) return;
    headRef.current.style.setProperty("--nahida-look-x", "0px");
    headRef.current.style.setProperty("--nahida-look-y", "0px");
    headRef.current.style.setProperty("--nahida-look-angle", "0deg");
  }

  function handleClick(event: MouseEvent<HTMLSpanElement>) {
    const target = targetAtPosition(event.clientX, event.clientY, event.currentTarget);
    if (target.kind === "dna") {
      setSelectedHistone(null);
      setSelectedDna({ labelX: target.labelX, labelY: target.labelY });
      return;
    }

    setSelectedDna(null);
    setSelectedHistone(target.kind === "histone" ? target.histone : null);
  }

  return (
    <figure className="interactive-figure">
      <span
        className="interactive-figure-stage"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        aria-label="点击组蛋白或 DNA，在原位显示颜色与名称"
      >
        <img
          className="nucleosome-motion-image"
          src="/interactive-nucleosome-animated.webp"
          alt="彩色纳西妲坐在黑白核小体 DNA 上，轻轻晃动头部和双腿的插画"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
        <img
          className="nucleosome-still-image"
          src="/interactive-nucleosome-3x.png"
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
          className={`dna-color-layer${selectedDna ? " is-selected" : ""}`}
          src="/dna-overlay-white.png"
          alt=""
          aria-hidden="true"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
        {selectedDna ? (
          <span
            className="dna-label"
            style={{ left: `${selectedDna.labelX}%`, top: `${selectedDna.labelY}%` }}
            aria-hidden="true"
          >
            核小体DNA
          </span>
        ) : null}
        <img
          className="nahida-foreground-guard nahida-motion-guard"
          src="/interactive-nucleosome-animated.webp"
          alt=""
          aria-hidden="true"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
        <img
          className="nahida-foreground-guard nahida-still-guard"
          src="/interactive-nucleosome-3x.png"
          alt=""
          aria-hidden="true"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
        <span ref={headRef} className="nahida-head-window" aria-hidden="true">
          <img
            className="nahida-head-tracker nahida-head-motion"
            src="/interactive-nucleosome-animated.webp"
            alt=""
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
          />
          <img
            className="nahida-head-tracker nahida-head-still"
            src="/interactive-nucleosome-3x.png"
            alt=""
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
          />
        </span>
        <span ref={cursorRef} className="nahida-cursor" aria-hidden="true" />
      </span>
    </figure>
  );
}
