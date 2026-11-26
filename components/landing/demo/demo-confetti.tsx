"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#B6F22E", "#FF8FB8", "#FF6A3D", "#111111", "#FFF4E0"];
const PARTICLE_COUNT = 110;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  shape: "rect" | "circle";
};

export function DemoConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.scale(pixelRatio, pixelRatio);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 7 + Math.random() * 9;
      return {
        x: width / 2,
        y: height * 0.65,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        gravity: 0.1 + Math.random() * 0.08,
        drag: 0.985 + Math.random() * 0.01,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.24,
        width: 5 + Math.random() * 5,
        height: 8 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#B6F22E",
        shape: Math.random() > 0.2 ? "rect" : "circle",
      };
    });

    let animationFrame = 0;
    const startedAt = performance.now();

    const draw = (now: number) => {
      const elapsed = now - startedAt;
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.vx *= particle.drag;
        particle.vy = particle.vy * particle.drag + particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        if (particle.shape === "circle") {
          context.beginPath();
          context.arc(0, 0, particle.width / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
        }
        context.restore();
      }

      if (elapsed < 3200) animationFrame = requestAnimationFrame(draw);
      else context.clearRect(0, 0, width, height);
    }

    animationFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-demo-confetti
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
}
