export function EnvelopeArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      aria-hidden="true"
      className={`h-auto w-full drop-shadow-[6px_6px_0_#111] ${className}`}
    >
      <rect x="16" y="36" width="248" height="132" rx="12" fill="var(--special-accent, #FF6A3D)" stroke="#111" strokeWidth="5" />
      <path d="M20 46 140 126 260 46" fill="var(--special-accent-soft, #B6F22E)" stroke="#111" strokeWidth="5" strokeLinejoin="round" />
      <path d="M20 161 105 103M260 161 175 103" stroke="#111" strokeWidth="4" strokeLinecap="round" />
      <circle cx="140" cy="126" r="24" fill="var(--special-surface, #FFF4E0)" stroke="#111" strokeWidth="4" />
      <path d="m140 136-10-10a6 6 0 0 1 8-9l2 2 2-2a6 6 0 0 1 8 9Z" fill="var(--special-accent, #FF8FB8)" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
