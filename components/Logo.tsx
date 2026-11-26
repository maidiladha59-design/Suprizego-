import { LogoInteractive } from "@/components/logo-interactive";

type LogoSize = "sm" | "md" | "lg" | number;

type LogoProps = {
  size?: LogoSize;
  animated?: boolean;
  className?: string;
};

const LOGO_SIZES = {
  sm: 32,
  md: 36,
  lg: 48,
} as const;

export function Logo({ size = "md", animated = true, className = "" }: LogoProps) {
  const dimension = typeof size === "number" ? size : LOGO_SIZES[size];

  const artwork = (
      <svg focusable="false" height="100%" viewBox="0 0 56 56" width="100%">
        <rect x="4" y="6" width="44" height="44" rx="11" fill="#111111" />
        <rect
          x="1.5"
          y="1.5"
          width="44"
          height="44"
          rx="11"
          fill="#B6F22E"
          stroke="#111111"
          strokeWidth="3"
        />
        <g className="sg-logo__mascot">
          <rect
            x="12"
            y="20"
            width="24"
            height="18"
            rx="3"
            fill="#FFF4E0"
            stroke="#111111"
            strokeWidth="2.5"
          />
          <path
            d="m12.8 22.2 9.1 6.2M35.2 22.2l-9.1 6.2"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="sg-logo__flap"
            d="M12.5 20.5 24 25.5 35.5 20.5Z"
            fill="#FF8FB8"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g className="sg-logo__expression sg-logo__expression--smile" opacity="1">
            <circle cx="20" cy="29" r="1.8" fill="#111111" />
            <circle cx="28" cy="29" r="1.8" fill="#111111" />
            <path
              d="M21 33.2c1.6 2.1 4.4 2.1 6 0"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          {animated && (
            <>
          <g className="sg-logo__expression sg-logo__expression--happy" opacity="0">
            <circle cx="17.2" cy="31.5" r="2" fill="#FF8FB8" />
            <circle cx="30.8" cy="31.5" r="2" fill="#FF8FB8" />
            <path
              d="m17.8 29.7 2.2-2.1 2.2 2.1M25.8 29.7l2.2-2.1 2.2 2.1"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 32.8c1.6 2.8 4.4 2.8 6 0"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <g className="sg-logo__expression sg-logo__expression--surprised" opacity="0">
            <circle cx="20" cy="29" r="2.6" fill="#111111" />
            <circle cx="28" cy="29" r="2.6" fill="#111111" />
            <circle
              cx="24"
              cy="34"
              r="2.2"
              fill="#FFF4E0"
              stroke="#111111"
              strokeWidth="1.8"
            />
          </g>
          <g className="sg-logo__expression sg-logo__expression--wink" opacity="0">
            <circle cx="20" cy="29" r="1.8" fill="#111111" />
            <path
              d="M25.8 29.2q2.2 2.1 4.4 0"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M21.3 33.2c1.5 1.8 4.1 1.9 5.6 0"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <g className="sg-logo__expression sg-logo__expression--mischievous" opacity="0">
            <path
              d="m17.5 26.4 4.6 1.5M25.9 27.9l4.6-1.7"
              fill="none"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="20" cy="29.7" r="1.6" fill="#111111" />
            <path
              d="M26 29.7h4.1"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M21.5 33.5c1.8 2 4.1 1.6 5.6-0.9"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
            </>
          )}
        </g>
      </svg>
  );

  if (animated) {
    return (
      <LogoInteractive className={className} dimension={dimension}>
        {artwork}
      </LogoInteractive>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`sg-logo inline-flex shrink-0 ${className}`}
      data-animated="false"
      data-logo="suprizego"
      style={{ width: dimension, height: dimension }}
    >
      {artwork}
    </span>
  );
}
