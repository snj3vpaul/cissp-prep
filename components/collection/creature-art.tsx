import type { Colorway } from "@/lib/collection";

/** Soft top-left highlight laid over a shape, for a moulded-vinyl look. */
function Hl({ id, children }: { id: string; children: React.ReactNode }) {
  return <g fill={`url(#${id})`}>{children}</g>;
}

function Eye({ x, y, r = 7, c }: { x: number; y: number; r?: number; c: Colorway }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x + r * 0.12} cy={y + r * 0.08} r={r * 0.62} fill={c.eye} />
      <circle cx={x - r * 0.2} cy={y - r * 0.25} r={r * 0.22} fill="#fff" />
    </g>
  );
}

type Art = (c: Colorway, hl: string) => React.ReactNode;

const aegiscale: Art = (c, hl) => (
  <>
    <path d="M146 140 C178 140 184 108 166 99 C153 93 145 108 156 113" fill="none" stroke={c.body} strokeWidth="14" strokeLinecap="round" />
    <ellipse cx="108" cy="128" rx="50" ry="38" fill={c.body} />
    <clipPath id={`${hl}-aeg`}>
      <ellipse cx="108" cy="128" rx="50" ry="38" />
    </clipPath>
    <g clipPath={`url(#${hl}-aeg)`}>
      {[0, 1, 2, 3].map((r) =>
        Array.from({ length: 6 }, (_, k) => {
          const x = 62 + r * 7 + k * 18;
          const y = 96 + r * 15;
          return <path key={`${r}-${k}`} d={`M${x} ${y} a9 9 0 0 0 18 0`} fill={c.shade} stroke={c.body} strokeWidth="2" />;
        })
      )}
    </g>
    <Hl id={hl}>
      <ellipse cx="108" cy="128" rx="50" ry="38" />
    </Hl>
    <ellipse cx="104" cy="156" rx="30" ry="10" fill={c.belly} />
    <ellipse cx="82" cy="164" rx="12" ry="7" fill={c.shade} />
    <ellipse cx="130" cy="164" rx="12" ry="7" fill={c.shade} />
    <circle cx="62" cy="112" r="26" fill={c.body} />
    <Hl id={hl}>
      <circle cx="62" cy="112" r="26" />
    </Hl>
    <polygon points="46,92 50,76 56,90" fill={c.accent} />
    <polygon points="57,88 62,70 67,88" fill={c.accent} />
    <polygon points="68,90 74,76 78,92" fill={c.accent} />
    <ellipse cx="42" cy="121" rx="12" ry="9" fill={c.belly} />
    <circle cx="34" cy="119" r="3" fill={c.eye} />
    <Eye x={63} y={108} c={c} />
    <circle cx="72" cy="122" r="4" fill="#ff7f9e" opacity="0.45" />
  </>
);

const vaultmole: Art = (c, hl) => (
  <>
    <circle cx="66" cy="76" r="9" fill={c.shade} />
    <circle cx="134" cy="76" r="9" fill={c.shade} />
    <circle cx="100" cy="122" r="52" fill={c.body} />
    <Hl id={hl}>
      <circle cx="100" cy="122" r="52" />
    </Hl>
    <circle cx="100" cy="134" r="30" fill={c.belly} />
    <circle cx="100" cy="134" r="16" fill="none" stroke={c.accent} strokeWidth="4" />
    {[0, 45, 90, 135].map((a) => (
      <line key={a} x1="100" y1="122" x2="100" y2="146" stroke={c.accent} strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 100 134)`} />
    ))}
    <circle cx="100" cy="134" r="4.5" fill={c.accent} />
    <ellipse cx="100" cy="100" rx="14" ry="9" fill={c.belly} />
    <circle cx="100" cy="96" r="7" fill="#F59AB0" />
    <path d="M78 88 q6 -6 12 0" fill="none" stroke={c.eye} strokeWidth="3" strokeLinecap="round" />
    <path d="M110 88 q6 -6 12 0" fill="none" stroke={c.eye} strokeWidth="3" strokeLinecap="round" />
    {[66, 134].map((x) => (
      <g key={x}>
        <ellipse cx={x} cy="162" rx="17" ry="10" fill={c.belly} />
        {[-7, 0, 7].map((d) => (
          <line key={d} x1={x + d} y1="166" x2={x + d * 1.2} y2="174" stroke={c.shade} strokeWidth="3" strokeLinecap="round" />
        ))}
      </g>
    ))}
  </>
);

const pylonyx: Art = (c, hl) => (
  <>
    <path d="M140 136 Q180 130 194 152 Q172 146 140 154Z" fill={c.body} />
    <ellipse cx="110" cy="138" rx="50" ry="24" fill={c.body} />
    {[86, 110, 134].map((x, i) => {
      const y = 122 - (i === 1 ? 6 : 0);
      return (
        <g key={x}>
          <polygon points={`${x - 9},${y} ${x - 9},${y - 22} ${x},${y - 34} ${x + 9},${y - 22} ${x + 9},${y}`} fill={c.accent} opacity="0.9" />
          <polygon points={`${x},${y} ${x},${y - 34} ${x + 9},${y - 22} ${x + 9},${y}`} fill="#fff" opacity="0.25" />
        </g>
      );
    })}
    <Hl id={hl}>
      <ellipse cx="110" cy="138" rx="50" ry="24" />
    </Hl>
    <ellipse cx="112" cy="152" rx="38" ry="8" fill={c.belly} />
    {[82, 100, 128, 146].map((x, i) => (
      <ellipse key={x} cx={x} cy={162 + (i % 2) * 2} rx="7" ry="10" fill={c.shade} />
    ))}
    <ellipse cx="58" cy="124" rx="29" ry="20" fill={c.body} />
    <Hl id={hl}>
      <ellipse cx="58" cy="124" rx="29" ry="20" />
    </Hl>
    <path d="M32 132 Q50 138 70 133" fill="none" stroke={c.shade} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="36" cy="121" r="2.5" fill={c.eye} />
    <Eye x={58} y={117} c={c} />
  </>
);

const wing = (c: Colorway) => (
  <>
    <path d="M86 108 C60 78 28 80 16 100 C27 104 29 114 25 125 C38 120 44 128 44 139 C56 131 70 133 82 136 Z" fill={c.shade} />
    <path d="M84 112 L30 96 M82 120 L38 120 M82 128 L50 134" stroke={c.accent} strokeWidth="2" opacity="0.7" strokeLinecap="round" />
  </>
);

const relaybat: Art = (c, hl) => (
  <>
    {wing(c)}
    <g transform="translate(200 0) scale(-1 1)">{wing(c)}</g>
    <path d="M86 70 a20 20 0 0 1 28 0 M80 62 a30 30 0 0 1 40 0" fill="none" stroke={c.accent} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    <polygon points="78,96 72,64 96,88" fill={c.body} />
    <polygon points="122,96 128,64 104,88" fill={c.body} />
    <circle cx="72" cy="62" r="4.5" fill={c.accent} />
    <circle cx="128" cy="62" r="4.5" fill={c.accent} />
    <circle cx="100" cy="118" r="35" fill={c.body} />
    <Hl id={hl}>
      <circle cx="100" cy="118" r="35" />
    </Hl>
    <ellipse cx="100" cy="132" rx="20" ry="17" fill={c.belly} />
    <Eye x={87} y={111} c={c} />
    <Eye x={113} y={111} c={c} />
    <polygon points="94,124 97,131 100,124" fill="#fff" />
    <polygon points="100,124 103,131 106,124" fill="#fff" />
    <ellipse cx="88" cy="156" rx="8" ry="5" fill={c.shade} />
    <ellipse cx="112" cy="156" rx="8" ry="5" fill={c.shade} />
  </>
);

const keyfox: Art = (c, hl) => (
  <>
    <path d="M126 152 C170 152 180 112 162 92 C154 82 152 74 158 64" fill="none" stroke={c.body} strokeWidth="18" strokeLinecap="round" />
    <rect x="165" y="98" width="10" height="6" rx="1.5" fill={c.accent} />
    <rect x="167" y="110" width="12" height="6" rx="1.5" fill={c.accent} />
    <circle cx="160" cy="54" r="11" fill="none" stroke={c.accent} strokeWidth="6" />
    <ellipse cx="100" cy="136" rx="36" ry="37" fill={c.body} />
    <Hl id={hl}>
      <ellipse cx="100" cy="136" rx="36" ry="37" />
    </Hl>
    <ellipse cx="100" cy="140" rx="19" ry="25" fill={c.belly} />
    <polygon points="76,72 70,38 98,62" fill={c.body} />
    <polygon points="124,72 130,38 102,62" fill={c.body} />
    <polygon points="78,66 75,48 90,62" fill={c.belly} />
    <polygon points="122,66 125,48 110,62" fill={c.belly} />
    <circle cx="100" cy="88" r="30" fill={c.body} />
    <Hl id={hl}>
      <circle cx="100" cy="88" r="30" />
    </Hl>
    <ellipse cx="100" cy="100" rx="16" ry="11" fill={c.belly} />
    <circle cx="100" cy="94" r="4" fill={c.eye} />
    <Eye x={88} y={83} r={6} c={c} />
    <Eye x={112} y={83} r={6} c={c} />
    <ellipse cx="86" cy="170" rx="11" ry="6" fill={c.belly} />
    <ellipse cx="114" cy="170" rx="11" ry="6" fill={c.belly} />
  </>
);

const probeetle: Art = (c, hl) => (
  <>
    {[
      "M70 120 L48 126 L40 144",
      "M68 136 L46 146 L42 164",
      "M74 152 L56 162 L54 174",
      "M130 120 L152 126 L160 144",
      "M132 136 L154 146 L158 164",
      "M126 152 L144 162 L146 174",
    ].map((d) => (
      <path key={d} d={d} fill="none" stroke={c.shade} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    ))}
    <path d="M92 80 C86 64 78 54 68 44" fill="none" stroke={c.shade} strokeWidth="4" strokeLinecap="round" />
    <path d="M108 80 C114 64 122 54 132 44" fill="none" stroke={c.shade} strokeWidth="4" strokeLinecap="round" />
    <circle cx="66" cy="42" r="6" fill={c.accent} />
    <circle cx="134" cy="42" r="6" fill={c.accent} />
    <ellipse cx="100" cy="90" rx="24" ry="16" fill={c.shade} />
    <Eye x={90} y={89} r={6} c={c} />
    <Eye x={110} y={89} r={6} c={c} />
    <ellipse cx="100" cy="132" rx="48" ry="38" fill={c.body} />
    <Hl id={hl}>
      <ellipse cx="100" cy="132" rx="48" ry="38" />
    </Hl>
    <line x1="100" y1="96" x2="100" y2="168" stroke={c.shade} strokeWidth="3" />
    {[
      [80, 120],
      [120, 120],
      [84, 148],
      [116, 148],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="6.5" fill={c.accent} />
    ))}
  </>
);

const sentrowl: Art = (c, hl) => (
  <>
    <polygon points="70,74 64,46 88,66" fill={c.shade} />
    <polygon points="130,74 136,46 112,66" fill={c.shade} />
    <ellipse cx="100" cy="118" rx="44" ry="54" fill={c.body} />
    <Hl id={hl}>
      <ellipse cx="100" cy="118" rx="44" ry="54" />
    </Hl>
    <ellipse cx="60" cy="126" rx="13" ry="34" fill={c.shade} transform="rotate(12 60 126)" />
    <ellipse cx="140" cy="126" rx="13" ry="34" fill={c.shade} transform="rotate(-12 140 126)" />
    <ellipse cx="100" cy="142" rx="26" ry="26" fill={c.belly} />
    {[132, 142, 152].map((y) => (
      <path key={y} d={`M90 ${y} l10 6 l10 -6`} fill="none" stroke={c.shade} strokeWidth="2" strokeLinecap="round" />
    ))}
    {[82, 118].map((x) => (
      <g key={x}>
        <circle cx={x} cy="98" r="18" fill={c.belly} stroke={c.accent} strokeWidth="4" />
        <circle cx={x} cy="98" r="9" fill={c.eye} />
        <circle cx={x - 3} cy="94" r="3" fill="#fff" />
      </g>
    ))}
    <polygon points="100,108 93,118 107,118" fill={c.accent} />
    <ellipse cx="88" cy="172" rx="8" ry="4" fill={c.accent} />
    <ellipse cx="112" cy="172" rx="8" ry="4" fill={c.accent} />
  </>
);

const bytenewt: Art = (c, hl) => (
  <>
    <path d="M146 134 C176 128 192 140 196 154 C180 150 164 152 146 152Z" fill={c.shade} />
    <ellipse cx="115" cy="142" rx="42" ry="20" fill={c.body} />
    <Hl id={hl}>
      <ellipse cx="115" cy="142" rx="42" ry="20" />
    </Hl>
    <ellipse cx="114" cy="152" rx="30" ry="7" fill={c.belly} />
    {[88, 102, 130, 144].map((x) => (
      <ellipse key={x} cx={x} cy="162" rx="6" ry="8" fill={c.shade} />
    ))}
    {[
      "M44 102 L30 92",
      "M40 112 L24 110",
      "M42 122 L28 130",
      "M98 100 L112 88",
      "M102 110 L118 104",
      "M100 120 L116 122",
    ].map((d) => (
      <path key={d} d={d} stroke={c.accent} strokeWidth="6" strokeLinecap="round" />
    ))}
    <ellipse cx="70" cy="118" rx="34" ry="27" fill={c.body} />
    <Hl id={hl}>
      <ellipse cx="70" cy="118" rx="34" ry="27" />
    </Hl>
    <Eye x={57} y={113} r={6} c={c} />
    <Eye x={84} y={113} r={6} c={c} />
    <path d="M63 128 q8 6 16 0" fill="none" stroke={c.eye} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="126" r="4" fill="#ff7f9e" opacity="0.45" />
    <circle cx="92" cy="126" r="4" fill="#ff7f9e" opacity="0.45" />
  </>
);

const cipherion: Art = (c, hl) => (
  <>
    <path d="M78 110 C50 70 18 72 8 96 C24 98 26 110 20 122 C36 116 44 126 44 138 C58 128 70 130 80 134Z" fill={c.shade} />
    <path d="M122 110 C150 70 182 72 192 96 C176 98 174 110 180 122 C164 116 156 126 156 138 C142 128 130 130 120 134Z" fill={c.shade} />
    <path d="M24 96 L76 116 M30 120 L78 124 M178 96 L124 116 M172 120 L122 124" stroke={c.accent} strokeWidth="2" opacity="0.6" />
    <path d="M132 156 C164 166 182 150 180 132" fill="none" stroke={c.body} strokeWidth="12" strokeLinecap="round" />
    <polygon points="176,128 190,124 184,138" fill={c.accent} />
    <ellipse cx="100" cy="134" rx="40" ry="36" fill={c.body} />
    <Hl id={hl}>
      <ellipse cx="100" cy="134" rx="40" ry="36" />
    </Hl>
    <ellipse cx="100" cy="142" rx="24" ry="26" fill={c.belly} />
    <circle cx="100" cy="134" r="7" fill={c.accent} />
    <polygon points="96,138 104,138 102,152 98,152" fill={c.accent} />
    <path d="M86 60 C80 46 74 38 66 32" fill="none" stroke={c.accent} strokeWidth="6" strokeLinecap="round" />
    <path d="M114 60 C120 46 126 38 134 32" fill="none" stroke={c.accent} strokeWidth="6" strokeLinecap="round" />
    <circle cx="100" cy="82" r="28" fill={c.body} />
    <Hl id={hl}>
      <circle cx="100" cy="82" r="28" />
    </Hl>
    <ellipse cx="100" cy="96" rx="16" ry="10" fill={c.belly} />
    <circle cx="95" cy="95" r="2" fill={c.shade} />
    <circle cx="105" cy="95" r="2" fill={c.shade} />
    <Eye x={89} y={78} r={6} c={c} />
    <Eye x={111} y={78} r={6} c={c} />
    <ellipse cx="84" cy="168" rx="11" ry="6" fill={c.shade} />
    <ellipse cx="116" cy="168" rx="11" ry="6" fill={c.shade} />
  </>
);

export const ART: Record<string, Art> = { aegiscale, vaultmole, pylonyx, relaybat, keyfox, probeetle, sentrowl, bytenewt, cipherion };
