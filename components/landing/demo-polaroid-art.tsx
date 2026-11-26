type DemoScene = "beach" | "rain" | "city";

const INK = "#111111";
const PAPER = "#FFF4E0";
const LIME = "#B6F22E";
const CANDY = "#FF8FB8";
const TANGERINE = "#FF6A3D";
const SUN = "#FFCA3A";

export function DemoPolaroidArt({ scene }: { scene: DemoScene }) {
  return (
    <svg
      viewBox="0 0 240 270"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="size-full"
      fill="none"
      stroke={INK}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {scene === "beach" ? <BeachScene /> : null}
      {scene === "rain" ? <RainScene /> : null}
      {scene === "city" ? <CityScene /> : null}
    </svg>
  );
}

function BeachScene() {
  return (
    <g>
      <rect width="240" height="270" fill={CANDY} stroke="none" />
      <circle cx="176" cy="66" r="34" fill={SUN} strokeWidth="4" />
      <path d="M0 128h240v142H0z" fill="#69C7E8" stroke="none" />
      <path d="M0 151c28-12 48 12 76 0s48 12 76 0 48 12 88 0" stroke={PAPER} strokeWidth="5" />
      <path d="M0 185c28-12 48 12 76 0s48 12 76 0 48 12 88 0" stroke={PAPER} strokeWidth="4" />
      <path d="M0 218c40-20 74 18 120 0s80 18 120 0v52H0z" fill={SUN} strokeWidth="4" />
      <path d="M151 199h58l-9 35h-40z" fill={TANGERINE} strokeWidth="4" />
      <path d="M180 199v-44l34 34h-34" fill={PAPER} strokeWidth="4" />
      <path d="M29 77h23M35 65v24" strokeWidth="4" />
      <path d="m72 42 4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill={PAPER} strokeWidth="3" />
    </g>
  );
}

function RainScene() {
  return (
    <g>
      <rect width="240" height="270" fill="#A9D9E8" stroke="none" />
      <path d="M0 86c18-18 36-18 54 0s36 18 54 0 36-18 54 0 36 18 54 0 24-12 24-12v196H0z" fill={PAPER} stroke="none" />
      <path d="M0 175h240v95H0z" fill="#6F7D86" stroke="none" />
      <path d="M0 205h240M0 241h240" stroke={PAPER} strokeWidth="4" strokeDasharray="18 14" />
      <path d="M30 112v112M210 112v112" strokeWidth="6" />
      <path d="M17 111h106v17H17zM117 111h106v17H117z" fill={LIME} strokeWidth="4" />
      <path d="M40 128v29h60v-29M140 128v29h60v-29" fill={CANDY} strokeWidth="4" />
      <path d="M55 157h30M155 157h30" strokeWidth="5" />
      <g strokeWidth="3">
        <path d="m28 37-7 15M64 25l-7 15M100 39l-7 15M137 23l-7 15M174 40l-7 15M211 27l-7 15" />
        <path d="m42 73-7 15M79 61l-7 15M115 75l-7 15M152 59l-7 15M189 77l-7 15" />
      </g>
      <path d="M23 223c17-14 34 14 51 0s34 14 51 0 34 14 51 0 34 14 51 0" stroke="#A9D9E8" strokeWidth="4" />
    </g>
  );
}

function CityScene() {
  return (
    <g>
      <rect width="240" height="270" fill="#29243D" stroke="none" />
      <circle cx="181" cy="55" r="27" fill={SUN} strokeWidth="4" />
      <circle cx="192" cy="47" r="27" fill="#29243D" stroke="none" />
      <g strokeWidth="4">
        <path d="M0 112h48v158H0z" fill={TANGERINE} />
        <path d="M54 78h55v192H54z" fill={CANDY} />
        <path d="M116 130h46v140h-46z" fill={LIME} />
        <path d="M169 96h71v174h-71z" fill="#67578A" />
      </g>
      <g fill={PAPER} stroke="none">
        <path d="M12 132h10v14H12zM31 132h10v14H31zM12 160h10v14H12zM31 160h10v14H31zM12 188h10v14H12zM31 188h10v14H31z" />
        <path d="M67 99h12v16H67zM91 99h11v16H91zM67 130h12v16H67zM91 130h11v16H91zM67 161h12v16H67zM91 161h11v16H91zM67 192h12v16H67zM91 192h11v16H91z" />
        <path d="M128 151h10v14h-10zM145 151h10v14h-10zM128 180h10v14h-10zM145 180h10v14h-10zM128 209h10v14h-10zM145 209h10v14h-10z" />
        <path d="M182 119h13v17h-13zM211 119h13v17h-13zM182 151h13v17h-13zM211 151h13v17h-13zM182 183h13v17h-13zM211 183h13v17h-13z" />
      </g>
      <path d="M0 248h240v22H0z" fill={INK} stroke="none" />
      <path d="M99 248v-28h42v28" fill={PAPER} strokeWidth="4" />
      <path d="M106 220h28M120 220v28" strokeWidth="3" />
      <path d="m24 49 3 7 7 3-7 3-3 7-3-7-7-3 7-3zM126 44l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={PAPER} strokeWidth="2" />
    </g>
  );
}
