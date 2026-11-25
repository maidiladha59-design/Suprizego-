import Link from "next/link";
import { SparkleIcon } from "@/components/ui/icons";

type BrandProps = {
  tone?: "ink" | "cream";
  size?: "md" | "lg";
  className?: string;
};

export function Brand({ tone = "ink", size = "md", className = "" }: BrandProps) {
  const wordColor = tone === "cream" ? "text-cream" : "text-ink";
  const tileSize = size === "lg" ? "size-12" : "size-9";
  const iconSize = size === "lg" ? "size-6" : "size-[1.1rem]";
  const wordSize = size === "lg" ? "text-[1.5rem]" : "text-[1.1rem] sm:text-[1.22rem]";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="SuprizeGo — kembali ke beranda"
    >
      <span
        className={`grid ${tileSize} shrink-0 place-items-center rounded-[0.7rem] border-[3px] border-ink bg-lime text-ink shadow-[3px_3px_0_#111] transition-transform duration-200 group-hover:-rotate-6`}
      >
        <SparkleIcon className={iconSize} />
      </span>
      <span
        className={`font-display ${wordSize} font-extrabold uppercase leading-none tracking-[-0.035em] ${wordColor}`}
      >
        Suprize
        <span className="ml-1 inline-flex -rotate-3 items-center rounded-md border-2 border-ink bg-lime px-1.5 py-1 align-[0.08em] text-[0.6em] leading-none text-ink shadow-[2px_2px_0_#111]">
          Go
        </span>
      </span>
    </Link>
  );
}
