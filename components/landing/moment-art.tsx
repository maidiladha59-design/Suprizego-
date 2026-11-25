import type { MomentId } from "@/lib/moments";

const INK = "#111111";
const PAPER = "#FFF6E4";
const LIME = "#B6F22E";
const CANDY = "#FFA6C4";
const TANGERINE = "#FF6B3A";
const SUN = "#FFCA3A";

function Star({
  x,
  y,
  scale = 0.7,
  fill = INK,
}: {
  x: number;
  y: number;
  scale?: number;
  fill?: string;
}) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M0 -11 2.4 -2.4 11 0 2.4 2.4 0 11 -2.4 2.4 -11 0 -2.4 -2.4Z"
      fill={fill}
      stroke="none"
    />
  );
}

export function MomentArt({ moment, className }: { moment: MomentId; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke={INK}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {moment === "pengakuan" ? <PengakuanArt /> : null}
      {moment === "ulang-tahun" ? <UlangTahunArt /> : null}
      {moment === "anniversary" ? <AnniversaryArt /> : null}
      {moment === "minta-maaf" ? <MintaMaafArt /> : null}
      {moment === "wisuda" ? <WisudaArt /> : null}
    </svg>
  );
}

function PengakuanArt() {
  return (
    <g>
      <rect x="38" y="45" width="164" height="101" rx="13" fill={TANGERINE} />
      <path d="M44 53 120 106 196 53" fill={LIME} />
      <path d="M44 140 101 97M196 140 139 97" />
      <circle cx="120" cy="107" r="23" fill={PAPER} strokeWidth="4" />
      <path
        d="M120 118s-11-6-11-13.4a6.6 6.6 0 0 1 11-4.4 6.6 6.6 0 0 1 11 4.4C131 112 120 118 120 118z"
        fill={CANDY}
        strokeWidth="3.5"
      />
      <Star x={205} y={32} scale={0.9} />
      <Star x={31} y={105} scale={0.6} />
      <Star x={203} y={129} scale={0.5} />
    </g>
  );
}

function UlangTahunArt() {
  return (
    <g>
      <rect x="34" y="121" width="172" height="12" rx="6" fill={PAPER} />
      <path d="M49 94h142a10 10 0 0 1 10 10v17H39v-17a10 10 0 0 1 10-10z" fill={CANDY} />
      <path d="M63 97V84a9 9 0 0 1 9-9h96a9 9 0 0 1 9 9v13" fill={PAPER} />
      <path d="M63 86h114" strokeWidth="4" />
      <rect x="82" y="50" width="9" height="28" rx="4" fill={LIME} strokeWidth="4" />
      <rect x="115" y="44" width="9" height="34" rx="4" fill={TANGERINE} strokeWidth="4" />
      <rect x="148" y="50" width="9" height="28" rx="4" fill={LIME} strokeWidth="4" />
      <path d="M86.5 35c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" fill={SUN} strokeWidth="3" />
      <path d="M119.5 29c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" fill={SUN} strokeWidth="3" />
      <path d="M152.5 35c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" fill={SUN} strokeWidth="3" />
      <circle cx="68" cy="108" r="3" fill={PAPER} strokeWidth="3" />
      <circle cx="120" cy="108" r="3" fill={PAPER} strokeWidth="3" />
      <circle cx="172" cy="108" r="3" fill={PAPER} strokeWidth="3" />
      <Star x={43} y={45} scale={0.65} />
      <Star x={199} y={58} scale={0.55} />
    </g>
  );
}

function AnniversaryArt() {
  return (
    <g>
      <circle cx="94" cy="94" r="38" strokeWidth="13" />
      <circle cx="94" cy="94" r="38" stroke={LIME} strokeWidth="6" />
      <circle cx="146" cy="94" r="38" strokeWidth="13" />
      <circle cx="146" cy="94" r="38" stroke={CANDY} strokeWidth="6" />
      <path
        d="M120 58s-14-8-14-17a8.4 8.4 0 0 1 14-5.6A8.4 8.4 0 0 1 134 41c0 9-14 17-14 17z"
        fill={CANDY}
        strokeWidth="4"
      />
      <Star x={44} y={40} scale={0.7} />
      <Star x={196} y={42} scale={0.55} />
      <Star x={184} y={138} scale={0.45} />
    </g>
  );
}

function MintaMaafArt() {
  return (
    <g>
      <path
        d="M120 134c-3 0-55-32-55-68 0-16 13-29 29-29 10 0 19 6 26 15 7-9 16-15 26-15 16 0 29 13 29 29 0 36-52 68-55 68z"
        fill={CANDY}
      />
      <g transform="rotate(-18 120 87)">
        <rect x="66" y="75" width="108" height="24" rx="12" fill={PAPER} />
        <circle cx="94" cy="87" r="2.6" fill={INK} stroke="none" />
        <circle cx="106" cy="87" r="2.6" fill={INK} stroke="none" />
        <circle cx="134" cy="87" r="2.6" fill={INK} stroke="none" />
        <circle cx="146" cy="87" r="2.6" fill={INK} stroke="none" />
      </g>
      <path
        d="M189 48c-4 6-7 10-7 14a7 7 0 0 0 14 0c0-4-3-8-7-14z"
        fill={SUN}
        strokeWidth="4"
      />
      <Star x={38} y={111} scale={0.6} />
      <Star x={201} y={116} scale={0.5} />
    </g>
  );
}

function WisudaArt() {
  return (
    <g>
      <path d="M72 88v18c0 13 21 23 48 23s48-10 48-23V88z" fill={LIME} />
      <path d="M120 34 210 68 120 102 30 68z" fill={INK} />
      <path d="M199 70v36" strokeWidth="9" />
      <path d="M199 70v36" stroke={LIME} strokeWidth="4" />
      <circle cx="199" cy="110" r="6" fill={SUN} strokeWidth="4" />
      <g transform="rotate(-12 182 128)">
        <rect x="149" y="118" width="66" height="20" rx="10" fill={PAPER} />
        <path d="M172 118v20" stroke={TANGERINE} strokeWidth="10" />
        <path d="M167.5 118v20M176.5 118v20" strokeWidth="2.5" />
      </g>
      <Star x={44} y={37} scale={0.7} />
      <Star x={198} y={41} scale={0.55} />
      <Star x={50} y={132} scale={0.45} />
    </g>
  );
}
