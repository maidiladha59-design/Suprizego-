import type { ReactNode } from "react";
import { SparkleIcon } from "@/components/ui/icons";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div className={`${isCentered ? "mx-auto text-center" : "text-left"} ${className}`}>
      <p
        className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-rose ${
          isCentered ? "justify-center" : ""
        }`}
      >
        <SparkleIcon className="size-3" />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl leading-[1.08] tracking-tight text-ink sm:text-4xl md:text-[2.9rem]">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base ${
            isCentered ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
