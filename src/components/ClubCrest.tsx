// ---------------------------------------------------------------------------
// Generated club crest: a simple shield in the club's real colours with its
// abbreviation. We deliberately do NOT use official club badges (trademarks);
// colours + a generic shield keep us clean and match the minimal design.
// Unknown clubs (e.g. newly promoted) get deterministic fallback colours.
// ---------------------------------------------------------------------------

interface CrestStyle {
  primary: string;
  secondary: string;
  pattern: 'solid' | 'stripes' | 'halves';
  /** Colour of the abbreviation lettering. */
  text: string;
  abbr: string;
}

/** Kit-inspired colours per ESPN club id (2025/26 clubs). */
const STYLES: Record<string, CrestStyle> = {
  '359': { primary: '#EF0107', secondary: '#FFFFFF', pattern: 'solid', text: '#FFFFFF', abbr: 'ARS' },
  '362': { primary: '#670E36', secondary: '#95BFE5', pattern: 'halves', text: '#FFFFFF', abbr: 'AVL' },
  '349': { primary: '#DA291C', secondary: '#000000', pattern: 'stripes', text: '#FFFFFF', abbr: 'BOU' },
  '337': { primary: '#E30613', secondary: '#FFFFFF', pattern: 'stripes', text: '#FFFFFF', abbr: 'BRE' },
  '331': { primary: '#0057B8', secondary: '#FFFFFF', pattern: 'stripes', text: '#FFFFFF', abbr: 'BHA' },
  '379': { primary: '#6C1D45', secondary: '#99D6EA', pattern: 'halves', text: '#FFFFFF', abbr: 'BUR' },
  '363': { primary: '#034694', secondary: '#FFFFFF', pattern: 'solid', text: '#FFFFFF', abbr: 'CHE' },
  '384': { primary: '#1B458F', secondary: '#C4122E', pattern: 'stripes', text: '#FFFFFF', abbr: 'CRY' },
  '368': { primary: '#003399', secondary: '#FFFFFF', pattern: 'solid', text: '#FFFFFF', abbr: 'EVE' },
  '370': { primary: '#FFFFFF', secondary: '#000000', pattern: 'solid', text: '#000000', abbr: 'FUL' },
  '357': { primary: '#FFFFFF', secondary: '#1D428A', pattern: 'solid', text: '#1D428A', abbr: 'LEE' },
  '364': { primary: '#C8102E', secondary: '#F6EB61', pattern: 'solid', text: '#FFFFFF', abbr: 'LIV' },
  '382': { primary: '#6CABDD', secondary: '#FFFFFF', pattern: 'solid', text: '#FFFFFF', abbr: 'MNC' },
  '360': { primary: '#DA291C', secondary: '#FBE122', pattern: 'solid', text: '#FBE122', abbr: 'MAN' },
  '361': { primary: '#241F20', secondary: '#FFFFFF', pattern: 'stripes', text: '#FFFFFF', abbr: 'NEW' },
  '393': { primary: '#DD0000', secondary: '#FFFFFF', pattern: 'solid', text: '#FFFFFF', abbr: 'NFO' },
  '366': { primary: '#EB172B', secondary: '#FFFFFF', pattern: 'stripes', text: '#FFFFFF', abbr: 'SUN' },
  '367': { primary: '#FFFFFF', secondary: '#132257', pattern: 'solid', text: '#132257', abbr: 'TOT' },
  '371': { primary: '#7A263A', secondary: '#1BB1E7', pattern: 'halves', text: '#FFFFFF', abbr: 'WHU' },
  '380': { primary: '#FDB913', secondary: '#231F20', pattern: 'solid', text: '#231F20', abbr: 'WOL' },
};

/** Deterministic fallback for clubs not in the map (e.g. promoted sides). */
function fallbackStyle(teamId: string, name: string): CrestStyle {
  let h = 0;
  for (let i = 0; i < teamId.length; i++) h = (h * 31 + teamId.charCodeAt(i)) % 360;
  return {
    primary: `hsl(${h} 60% 38%)`,
    secondary: `hsl(${h} 55% 75%)`,
    pattern: 'solid',
    text: '#FFFFFF',
    abbr: name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || '???',
  };
}

const SHIELD_PATH = 'M50 4 L94 16 V58 C94 86 50 106 50 106 C50 106 6 86 6 58 V16 Z';

export default function ClubCrest({
  teamId,
  name = '',
  size = 24,
  showText = true,
}: {
  teamId: string;
  name?: string;
  size?: number;
  showText?: boolean;
}) {
  const style = STYLES[teamId] ?? fallbackStyle(teamId, name);
  const clipId = `crest-${teamId}`;

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 100 110"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SHIELD_PATH} />
        </clipPath>
      </defs>

      {/* Base */}
      <path d={SHIELD_PATH} fill={style.primary} />

      {/* Pattern */}
      <g clipPath={`url(#${clipId})`}>
        {style.pattern === 'stripes' && (
          <>
            <rect x="18" y="0" width="14" height="110" fill={style.secondary} />
            <rect x="43" y="0" width="14" height="110" fill={style.secondary} />
            <rect x="68" y="0" width="14" height="110" fill={style.secondary} />
          </>
        )}
        {style.pattern === 'halves' && (
          <rect x="50" y="0" width="50" height="110" fill={style.secondary} />
        )}
      </g>

      {/* Border (subtle, adapts to light/dark via currentColor opacity) */}
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="4"
      />

      {/* Abbreviation on a soft band so it reads over any pattern */}
      {showText && (
        <>
          <rect
            x="10"
            y="38"
            width="80"
            height="32"
            fill={style.primary}
            opacity="0.85"
            clipPath={`url(#${clipId})`}
          />
          <text
            x="50"
            y="62"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontWeight="800"
            fontSize="28"
            fill={style.text}
          >
            {style.abbr}
          </text>
        </>
      )}
    </svg>
  );
}
