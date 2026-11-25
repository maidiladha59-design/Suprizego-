import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

type BrandProps = {
  tone?: "ink" | "cream";
  size?: "md" | "lg";
  className?: string;
};

export function Brand({ tone = "ink", size = "md", className = "" }: BrandProps) {
  const wordColor = tone === "cream" ? "text-cream" : "text-ink";
  const wordSize = size === "lg" ? "text-[1.5rem]" : "text-[1rem] sm:text-[1.06rem]";

  return (
    <div className={`brand-lockup inline-flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <BrandMark size={size} />
      <Link
        href="/"
        className={`font-display ${wordSize} whitespace-nowrap uppercase leading-none tracking-[-0.045em] ${wordColor}`}
        aria-label="SuprizeGo — kembali ke beranda"
      >
        SUPRIZEGO
      </Link>
    </div>
  );
}
