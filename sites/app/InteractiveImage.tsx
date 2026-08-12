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
  const motionImageRef = useRef<HTMLImageElement>(null);
  const stillImageRef = useRef<HTMLImageElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const lookAngleRef = useRef(0);
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

  useEffect(() => {
    const foregroundCanvas = foregroundCanvasRef.current;
    const foregroundContext = foregroundCanvas?.getContext("2d");
    if (!foregroundCanvas || !foregroundContext) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const traceHead = (context: CanvasRenderingContext2D) => {
      context.moveTo(1010, 160);
      context.lineTo(1080, 145);
      context.lineTo(1142, 165);
      context.lineTo(1170, 225);
      context.lineTo(1165, 305);
      context.lineTo(1135, 365);
      context.lineTo(1095, 382);
      context.lineTo(1050, 345);
      context.lineTo(1005, 318);
      context.lineTo(985, 260);
      context.closePath();
    };

    const traceHands = (context: CanvasRenderingContext2D) => {
      context.moveTo(960, 218);
      context.lineTo(991, 214);
      context.lineTo(1012, 244);
      context.lineTo(1005, 286);
      context.lineTo(986, 300);
      context.lineTo(966, 277);
      context.closePath();
      context.moveTo(979, 235);
      context.lineTo(1018, 230);
      context.lineTo(1044, 260);
      context.lineTo(1037, 320);
      context.lineTo(1012, 337);
      context.lineTo(985, 310);
      context.closePath();
    };

    const drawForeground = () => {
      const image = reducedMotion.matches ? stillImageRef.current : motionImageRef.current;
      foregroundContext.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

      if (image?.complete && image.naturalWidth) {
        foregroundContext.save();
        foregroundContext.beginPath();
        traceHead(foregroundContext);
        foregroundContext.clip();
        foregroundContext.fillStyle = "#ffffff";
        foregroundContext.fillRect(950, 125, 250, 285);
        foregroundContext.restore();

        const neckX = 1080;
        const neckY = 337;
        foregroundContext.save();
        foregroundContext.beginPath();
        traceHead(foregroundContext);
        foregroundContext.clip();
        foregroundContext.translate(neckX, neckY);
        foregroundContext.rotate(lookAngleRef.current);
        foregroundContext.translate(-neckX, -neckY);
        foregroundContext.drawImage(image, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        foregroundContext.restore();

        foregroundContext.save();
        foregroundContext.beginPath();
        traceHands(foregroundContext);
        foregroundContext.clip("evenodd");
        foregroundContext.drawImage(image, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        foregroundContext.restore();
      }

      animationFrame = requestAnimationFrame(drawForeground);
    };

    drawForeground();
    return () => cancelAnimationFrame(animationFrame);
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

    const angle = (normalizedY - 0.22) * 6 + (normalizedX - 0.73) * 2;
    lookAngleRef.current = Math.max(-3, Math.min(3, angle)) * (Math.PI / 180);
  }

  function handlePointerLeave() {
    lookAngleRef.current = 0;
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
          ref={motionImageRef}
          className="nucleosome-motion-image"
          src="/interactive-nucleosome-animated.webp"
          alt="彩色纳西妲坐在黑白核小体 DNA 上，轻轻晃动头部和双腿的插画"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
        />
        <img
          ref={stillImageRef}
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
        <canvas
          ref={foregroundCanvasRef}
          className="nahida-foreground-canvas"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          aria-hidden="true"
        />
        <span ref={cursorRef} className="nahida-cursor" aria-hidden="true" />
      </span>
    </figure>
  );
}
