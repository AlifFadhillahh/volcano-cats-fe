"use client";
import { useEffect, useRef } from "react";

interface EmberParticlesProps {
  count?: number;
}

export function EmberParticles({ count = 12 }: EmberParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const embers: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const ember = document.createElement("div");
      const size = Math.random() * 4 + 2;
      const startX = Math.random() * 100;
      const duration = Math.random() * 4 + 3;
      const delay = Math.random() * 4;
      const hue = Math.random() > 0.5 ? "#FF5C1A" : "#FFB547";

      ember.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${hue};
        border-radius: 50%;
        left: ${startX}vw;
        top: -10px;
        pointer-events: none;
        z-index: 0;
        box-shadow: 0 0 ${size * 2}px ${hue};
        animation: emberFall ${duration}s ${delay}s ease-in infinite;
      `;
      container.appendChild(ember);
      embers.push(ember);
    }

    return () => {
      embers.forEach(e => e.remove());
    };
  }, [count]);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" />;
}
