import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ResetIcon } from "@/components/ui/icons";
import { DEMO_THEME_LABELS, DEMO_THEMES, type DemoTheme } from "@/lib/demo-flow";

type DemoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "ink" | "cream" | "lime" | "coral" | "pink";
  size?: "sm" | "lg";
};

const TONES = {
  ink: "bg-ink text-paper",
  cream: "bg-paper text-ink",
  lime: "bg-lime text-ink",
  coral: "bg-tangerine text-ink",
  pink: "bg-candy text-ink",
} as const;

export function DemoButton({
  children,
  tone = "cream",
  size = "sm",
  className = "",
  type = "button",
  ...props
}: DemoButtonProps) {
  const shadow =
    tone === "ink"
      ? size === "lg"
        ? "shadow-[6px_6px_0_0_#B6F22E]"
        : "shadow-[4px_4px_0_0_#B6F22E]"
      : size === "lg"
        ? "shadow-[6px_6px_0_0_#111]"
        : "shadow-[4px_4px_0_0_#111]";

  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-ink px-3 font-display uppercase tracking-[0.01em] transition-[translate,box-shadow,background] duration-[120ms] hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-default disabled:opacity-60 ${
        size === "lg"
          ? "h-[59px] rounded-2xl border-[4px] text-base leading-6"
          : "h-[42px] rounded-xl border-[3px] text-[13.6px] leading-[1.5]"
      } ${TONES[tone]} ${shadow} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DemoThemeControls({
  theme,
  onThemeChange,
  onReset,
}: {
  theme: DemoTheme;
  onThemeChange: (theme: DemoTheme) => void;
  onReset: () => void;
}) {
  return (
    <div className="mt-5 flex flex-col items-center gap-2" aria-label="Kontrol demo">
      <div className="flex items-center justify-center gap-3">
        {DEMO_THEMES.map((item) => (
          <DemoButton
            key={item}
            tone={theme === item ? "lime" : "cream"}
            onClick={() => onThemeChange(item)}
            aria-pressed={theme === item}
            className="min-w-[141px]"
          >
            {DEMO_THEME_LABELS[item]}
          </DemoButton>
        ))}
      </div>
      <DemoButton onClick={onReset} className="min-w-[108px] bg-paper">
        <ResetIcon className="size-4" /> Ulang
      </DemoButton>
    </div>
  );
}
