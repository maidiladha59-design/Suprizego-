import type { CSSProperties, ReactNode } from "react";
import type { MomentId } from "@/lib/moments";
import type { SpecialDayIconId } from "@/lib/special-days";

type IconProps = {
  className?: string;
  style?: CSSProperties;
};

export function SparkleIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style} fill="currentColor">
      <path d="M12 2.2l2 5.9a2.4 2.4 0 0 0 1.5 1.5l5.9 2-5.9 2a2.4 2.4 0 0 0-1.5 1.5l-2 5.9-2-5.9a2.4 2.4 0 0 0-1.5-1.5l-5.9-2 5.9-2a2.4 2.4 0 0 0 1.5-1.5l2-5.9z" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MusicIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 16v4h16v-4" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20s-7.2-4.4-7.2-9.6A4.6 4.6 0 0 1 12 7.1a4.6 4.6 0 0 1 7.2 3.3C19.2 15.6 12 20 12 20z" />
    </svg>
  );
}

export function CakeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16" />
      <rect x="4" y="13.5" width="16" height="5" rx="1.5" />
      <rect x="7" y="8.5" width="10" height="5" rx="1.5" />
      <path d="M12 8.5V5.5" />
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RingsIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8.8" cy="14" r="5.2" />
      <circle cx="15.2" cy="14" r="5.2" />
      <path d="m9 4.5 1.5 2M15 4.5 13.5 6.5" />
    </svg>
  );
}

export function EnvelopeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 8 8 5.5L20 8" />
    </svg>
  );
}

export function GraduationCapIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5z" />
      <path d="M7 11.6V16c0 1.1 2.2 2 5 2s5-.9 5-2v-4.4" />
      <path d="M21 9.5V15" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13.5a4 4 0 0 0 5.7.1l2.6-2.6a4 4 0 0 0-5.6-5.6L11.2 7" />
      <path d="M14 10.5a4 4 0 0 0-5.7-.1l-2.6 2.6a4 4 0 0 0 5.6 5.6l1.5-1.6" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <circle cx="12" cy="15.2" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-3.2-.6L4 20l1.4-4.1A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 8 8 5.5L20 8" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v15" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

export function ResetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10a8 8 0 1 1 1.8 7.2" />
      <path d="M4 4v6h6" />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function GameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7h8a5 5 0 0 1 4.8 6.4l-1 3.1a2 2 0 0 1-3.4.8L14.8 16H9.2l-1.6 1.3a2 2 0 0 1-3.4-.8l-1-3.1A5 5 0 0 1 8 7Z" />
      <path d="M7 10v5M4.5 12.5h5" />
      <circle cx="16" cy="11" r=".8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13.5" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SpecialDaySvg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function SpecialDayIcon({ icon, className }: { icon: SpecialDayIconId; className?: string }) {
  switch (icon) {
    case "buku":
      return <SpecialDaySvg className={className}><path d="M4 5.5c2.8-.8 5.2-.3 8 1.4v12c-2.8-1.7-5.2-2.2-8-1.4v-12Z" /><path d="M20 5.5c-2.8-.8-5.2-.3-8 1.4v12c2.8-1.7 5.2-2.2 8-1.4v-12Z" /></SpecialDaySvg>;
    case "hati":
      return <HeartIcon className={className} />;
    case "lentera":
      return <SpecialDaySvg className={className}><path d="M8 4h8l1.5 12.5h-11L8 4Z" /><path d="M9.5 4V2.5h5V4M6 20h12M12 16.5v3.5M10 8h4" /></SpecialDaySvg>;
    case "bulan":
      return <SpecialDaySvg className={className}><path d="M19.5 15.2A8.5 8.5 0 0 1 8.8 4.5a8.5 8.5 0 1 0 10.7 10.7Z" /><path d="m17 3 .6 1.7L19.5 5l-1.9.6L17 7.5l-.6-1.9L14.5 5l1.9-.3L17 3Z" /></SpecialDaySvg>;
    case "labu":
      return <SpecialDaySvg className={className}><path d="M12 7c-5-3-9 1-8.5 6.5C4 18 8 20 12 20s8-2 8.5-6.5C21 8 17 4 12 7Z" /><path d="M12 7V4c0-1.5 2-2 3-1M8.5 8.5c-2 2-2 5 0 7M15.5 8.5c2 2 2 5 0 7" /><path d="m9 12 1.5 1.5M15 12l-1.5 1.5M10 16h4" /></SpecialDaySvg>;
    case "pohon":
      return <SpecialDaySvg className={className}><path d="m12 3-5 6h3l-5 6h5v5h4v-5h5l-5-6h3l-5-6Z" /></SpecialDaySvg>;
    case "pesta":
      return <SpecialDaySvg className={className}><path d="m4 20 4-12 8 8-12 4Z" /><path d="m14 4 2 2M19 8l2-1M17 2l-1 3M8 5 6 3M20 14l3 1" /><path d="m10 10 4 4" /></SpecialDaySvg>;
    case "kemeja":
      return <SpecialDaySvg className={className}><path d="m8 4-5 3 2 5 3-1v9h8v-9l3 1 2-5-5-3c-.8 2-7.2 2-8 0Z" /><path d="m8 4 4 4 4-4" /></SpecialDaySvg>;
    case "bunga":
      return <SpecialDaySvg className={className}><circle cx="12" cy="9" r="2" /><path d="M12 7c-4-1-5-5-2-6 2-.7 3 2 2 6ZM14 9c1-4 5-5 6-2 .7 2-2 3-6 2ZM12 11c4 1 5 5 2 6-2 .7-3-2-2-6ZM10 9c-1 4-5 5-6 2-.7-2 2-3 6-2Z" /><path d="M12 11v10M12 16c-3 0-5-2-5-4 3 0 5 2 5 4Z" /></SpecialDaySvg>;
    case "layangan":
      return <SpecialDaySvg className={className}><path d="m12 3 7 7-7 8-7-8 7-7Z" /><path d="M12 3v15M5 10h14M12 18c-3 3 3 3 0 6" /></SpecialDaySvg>;
    case "kembang":
      return <SpecialDaySvg className={className}><path d="M12 12c-6 0-8-4-6-7 2-2 5 0 6 4 1-4 4-6 6-4 2 3 0 7-6 7ZM12 12c0 6 4 8 7 6 2-2 0-5-4-6 4-1 6-4 4-6-3-2-7 0-7 6ZM12 12c-6 0-8 4-6 7 2 2 5 0 6-4 1 4 4 6 6 4 2-3 0-7-6-7Z" /></SpecialDaySvg>;
    case "pensil":
      return <SpecialDaySvg className={className}><path d="m4 20 1-5L16 4l4 4L9 19l-5 1Z" /><path d="m14 6 4 4M4 20l5-1" /></SpecialDaySvg>;
    case "bendera":
      return <SpecialDaySvg className={className}><path d="M5 21V3M5 4c5-3 9 3 14 0v10c-5 3-9-3-14 0" /></SpecialDaySvg>;
    case "benang":
      return <SpecialDaySvg className={className}><circle cx="9" cy="10" r="5" /><circle cx="9" cy="10" r="2" /><path d="M14 10h4c2 0 3 1 3 3v5c0 2-1 3-3 3h-2c-2 0-3-1-3-3v-2" /><path d="M9 5c4 0 7 3 7 7" /></SpecialDaySvg>;
    case "gulungan":
      return <SpecialDaySvg className={className}><path d="M6 4h12v16H6zM6 7c3 0 3-2 6-2s3 2 6 2M9 11h6M9 15h6" /></SpecialDaySvg>;
    case "lilin":
      return <SpecialDaySvg className={className}><path d="M9 10h6v10H9zM12 10V7" /><path d="M12 7c-3-2-1-5 0-6 1 1 3 4 0 6ZM7 21h10" /></SpecialDaySvg>;
    case "tangan":
      return <SpecialDaySvg className={className}><path d="m8 12-2-2c-1-1-3 1-2 2l5 6c1 1 2 2 4 2h2c3 0 5-2 5-5v-3c0-2-3-2-3 0V9c0-2-3-2-3 0V7c0-2-3-2-3 0v4-6c0-2-3-2-3 0v7Z" /></SpecialDaySvg>;
  }
}

export function MomentIcon({ moment, className }: { moment: MomentId; className?: string }) {
  switch (moment) {
    case "pengakuan":
      return <HeartIcon className={className} />;
    case "ulang-tahun":
      return <CakeIcon className={className} />;
    case "anniversary":
      return <RingsIcon className={className} />;
    case "minta-maaf":
      return <EnvelopeIcon className={className} />;
    case "wisuda":
      return <GraduationCapIcon className={className} />;
  }
}
