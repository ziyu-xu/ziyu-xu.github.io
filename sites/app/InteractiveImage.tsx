"use client";

import { useState } from "react";

export default function InteractiveImage() {
  const [motionKey, setMotionKey] = useState(0);

  return (
    <button
      type="button"
      className="interactive-figure"
      onClick={() => setMotionKey((current) => current + 1)}
      aria-label="让核小体插画动一下"
    >
      <span
        key={motionKey}
        className={motionKey > 0 ? "interactive-figure-motion" : undefined}
      >
        <img
          src="/interactive-nucleosome.png"
          alt="黑白复古风格的核小体和 DNA 插画"
          width="1448"
          height="1086"
        />
      </span>
      <span className="interactive-figure-caption">点击图片，让它动一下</span>
    </button>
  );
}
