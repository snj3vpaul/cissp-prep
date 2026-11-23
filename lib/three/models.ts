/**
 * 3D part lists for the cipher-core creatures, authored in the same 200×200 "side view"
 * coordinates as the SVG art (x right, y down, ground at y≈172). z points toward the camera.
 * The builder converts 50 units → 1 world unit.
 */
export type Role = "body" | "shade" | "belly" | "accent" | "eye" | "white" | "pink" | "crystal";

export type Part =
  | { k: "ell"; at: [number, number]; r: [number, number, number]; role: Role; z?: number; rot?: number }
  | { k: "tube"; d: string; w: number; role: Role; z?: number }
  | { k: "ext"; d: string; depth: number; role: Role; z?: number }
  | { k: "eye"; at: [number, number]; r: number; z: number }
  | { k: "cone"; at: [number, number]; r: number; h: number; role: Role; z?: number; tilt?: number }
  | { k: "crystal"; at: [number, number]; r: number; h: number; z?: number }
  | { k: "torus"; at: [number, number]; R: number; t: number; role: Role; z?: number }
  | { k: "box"; at: [number, number]; s: [number, number, number]; role: Role; z?: number; rot?: number }
  | { k: "plates"; on: { at: [number, number]; r: [number, number, number] }; rows: number; cols: number; size: number; role: Role }
  | { k: "studs"; on: { at: [number, number]; r: [number, number, number] }; pts: [number, number][]; size: number; role: Role };

const mirror = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${200 - Number(x)} ${y}`);

const BAT_WING = "M86 108 C60 78 28 80 16 100 C27 104 29 114 25 125 C38 120 44 128 44 139 C56 131 70 133 82 136 Z";

export const MODELS: Record<string, { parts: Part[]; turn: number }> = {
  aegiscale: {
    turn: 0.55,
    parts: [
      { k: "tube", d: "M146 140 C178 140 184 108 166 99 C153 93 145 108 156 113", w: 14, role: "body", z: -6 },
      { k: "ell", at: [108, 128], r: [50, 38, 40], role: "body" },
      { k: "plates", on: { at: [108, 128], r: [50, 38, 40] }, rows: 4, cols: 9, size: 10, role: "shade" },
      { k: "ell", at: [104, 156], r: [32, 10, 28], role: "belly", z: 4 },
      ...([[82, 20], [130, 20], [86, -20], [134, -20]] as const).map(([x, z]) => ({ k: "ell" as const, at: [x, 166] as [number, number], r: [12, 7, 12] as [number, number, number], role: "shade" as const, z })),
      { k: "ell", at: [60, 112], r: [26, 26, 26], role: "body", z: 8 },
      { k: "cone", at: [50, 88], r: 5, h: 15, role: "accent", z: 8, tilt: -0.35 },
      { k: "cone", at: [61, 82], r: 5.5, h: 17, role: "accent", z: 8 },
      { k: "cone", at: [72, 88], r: 5, h: 15, role: "accent", z: 8, tilt: 0.35 },
      { k: "ell", at: [40, 121], r: [13, 10, 13], role: "belly", z: 16 },
      { k: "ell", at: [30, 119], r: [3.5, 3.5, 3.5], role: "eye", z: 22 },
      { k: "eye", at: [61, 106], r: 7, z: 28 },
      { k: "ell", at: [72, 122], r: [4, 3, 2], role: "pink", z: 31 },
    ],
  },
  vaultmole: {
    turn: 0.25,
    parts: [
      { k: "ell", at: [66, 78], r: [10, 10, 7], role: "shade", z: -4 },
      { k: "ell", at: [134, 78], r: [10, 10, 7], role: "shade", z: -4 },
      { k: "ell", at: [100, 122], r: [52, 50, 46], role: "body" },
      { k: "ell", at: [100, 136], r: [31, 30, 12], role: "belly", z: 36 },
      { k: "torus", at: [100, 136], R: 16, t: 2.6, role: "accent", z: 47 },
      ...[0, 45, 90, 135].map((a) => ({ k: "box" as const, at: [100, 136] as [number, number], s: [3, 26, 2.5] as [number, number, number], role: "accent" as const, z: 47, rot: (a * Math.PI) / 180 })),
      { k: "ell", at: [100, 136], r: [5, 5, 4], role: "accent", z: 48 },
      { k: "ell", at: [100, 101], r: [15, 10, 12], role: "belly", z: 40 },
      { k: "ell", at: [100, 96], r: [7, 6, 6], role: "pink", z: 50 },
      { k: "tube", d: "M78 88 Q84 82 90 88", w: 3.2, role: "eye", z: 44 },
      { k: "tube", d: "M110 88 Q116 82 122 88", w: 3.2, role: "eye", z: 44 },
      { k: "ell", at: [64, 162], r: [17, 10, 16], role: "belly", z: 28 },
      { k: "ell", at: [136, 162], r: [17, 10, 16], role: "belly", z: 28 },
      ...([58, 64, 70, 130, 136, 142] as const).map((x) => ({ k: "ell" as const, at: [x, 170] as [number, number], r: [2, 2, 5] as [number, number, number], role: "shade" as const, z: 42 })),
    ],
  },
  pylonyx: {
    turn: 0.5,
    parts: [
      { k: "ext", d: "M140 136 Q180 130 194 152 Q172 146 140 154Z", depth: 14, role: "body", z: -7 },
      { k: "ell", at: [110, 138], r: [50, 24, 28], role: "body" },
      { k: "crystal", at: [86, 124], r: 9, h: 34 },
      { k: "crystal", at: [110, 118], r: 10, h: 40 },
      { k: "crystal", at: [134, 124], r: 9, h: 32 },
      { k: "ell", at: [112, 152], r: [38, 8, 22], role: "belly", z: 6 },
      { k: "ell", at: [82, 162], r: [7, 11, 7], role: "shade", z: 17 },
      { k: "ell", at: [128, 164], r: [7, 11, 7], role: "shade", z: 17 },
      { k: "ell", at: [100, 162], r: [7, 11, 7], role: "shade", z: -17 },
      { k: "ell", at: [146, 160], r: [7, 11, 7], role: "shade", z: -17 },
      { k: "ell", at: [58, 124], r: [29, 20, 22], role: "body" },
      { k: "ell", at: [34, 121], r: [2.5, 2.5, 2.5], role: "eye", z: 16 },
      { k: "eye", at: [58, 116], r: 7, z: 17 },
    ],
  },
  relaybat: {
    turn: 0.18,
    parts: [
      { k: "ext", d: BAT_WING, depth: 4, role: "shade", z: -14 },
      { k: "ext", d: mirror(BAT_WING), depth: 4, role: "shade", z: -14 },
      ...["M84 112 L30 96", "M82 120 L38 120", "M82 128 L50 134"].flatMap((d) => [
        { k: "tube" as const, d, w: 2, role: "accent" as const, z: -9 },
        { k: "tube" as const, d: mirror(d), w: 2, role: "accent" as const, z: -9 },
      ]),
      { k: "tube", d: "M86 70 A20 20 0 0 1 114 70", w: 3, role: "accent", z: 0 },
      { k: "tube", d: "M80 62 A30 30 0 0 1 120 62", w: 3, role: "accent", z: -2 },
      { k: "ext", d: "M78 98 L72 64 L96 88Z", depth: 8, role: "body", z: -2 },
      { k: "ext", d: "M122 98 L128 64 L104 88Z", depth: 8, role: "body", z: -2 },
      { k: "ell", at: [72, 62], r: [4.5, 4.5, 4.5], role: "accent", z: 2 },
      { k: "ell", at: [128, 62], r: [4.5, 4.5, 4.5], role: "accent", z: 2 },
      { k: "ell", at: [100, 118], r: [35, 35, 32], role: "body" },
      { k: "ell", at: [100, 132], r: [20, 17, 9], role: "belly", z: 25 },
      { k: "eye", at: [87, 111], r: 7, z: 26 },
      { k: "eye", at: [113, 111], r: 7, z: 26 },
      { k: "cone", at: [97, 129], r: 2.2, h: 6, role: "white", z: 31, tilt: Math.PI },
      { k: "cone", at: [103, 129], r: 2.2, h: 6, role: "white", z: 31, tilt: Math.PI },
      { k: "ell", at: [88, 156], r: [8, 5, 8], role: "shade", z: 12 },
      { k: "ell", at: [112, 156], r: [8, 5, 8], role: "shade", z: 12 },
    ],
  },
  keyfox: {
    turn: 0.3,
    parts: [
      { k: "tube", d: "M126 152 C170 152 180 112 162 92 C154 82 152 74 158 64", w: 18, role: "body", z: -16 },
      { k: "box", at: [171, 101], s: [10, 6, 6], role: "accent", z: -16 },
      { k: "box", at: [174, 113], s: [12, 6, 6], role: "accent", z: -16 },
      { k: "torus", at: [160, 52], R: 11, t: 3.2, role: "accent", z: -16 },
      { k: "ell", at: [100, 136], r: [36, 37, 32], role: "body" },
      { k: "ell", at: [100, 141], r: [19, 25, 10], role: "belly", z: 24 },
      { k: "ext", d: "M76 74 L70 38 L98 62Z", depth: 10, role: "body", z: -2 },
      { k: "ext", d: "M124 74 L130 38 L102 62Z", depth: 10, role: "body", z: -2 },
      { k: "ext", d: "M79 66 L75 48 L90 62Z", depth: 2, role: "belly", z: 8 },
      { k: "ext", d: "M121 66 L125 48 L110 62Z", depth: 2, role: "belly", z: 8 },
      { k: "ell", at: [100, 88], r: [30, 30, 28], role: "body", z: 4 },
      { k: "ell", at: [100, 101], r: [16, 11, 13], role: "belly", z: 26 },
      { k: "ell", at: [100, 95], r: [4.5, 3.5, 3.5], role: "eye", z: 39 },
      { k: "eye", at: [88, 83], r: 6, z: 28 },
      { k: "eye", at: [112, 83], r: 6, z: 28 },
      { k: "ell", at: [86, 170], r: [11, 6, 10], role: "belly", z: 18 },
      { k: "ell", at: [114, 170], r: [11, 6, 10], role: "belly", z: 18 },
    ],
  },
  probeetle: {
    turn: 0.35,
    parts: [
      ...["M70 120 L48 126 L40 144", "M68 136 L46 146 L42 164", "M74 152 L56 162 L54 174"].flatMap((d, i) => [
        { k: "tube" as const, d, w: 5, role: "shade" as const, z: 18 - i * 18 },
        { k: "tube" as const, d: mirror(d), w: 5, role: "shade" as const, z: 18 - i * 18 },
      ]),
      { k: "tube", d: "M92 80 C86 64 78 54 68 44", w: 4, role: "shade", z: 12 },
      { k: "tube", d: "M108 80 C114 64 122 54 132 44", w: 4, role: "shade", z: 12 },
      { k: "ell", at: [66, 42], r: [6, 6, 6], role: "accent", z: 12 },
      { k: "ell", at: [134, 42], r: [6, 6, 6], role: "accent", z: 12 },
      { k: "ell", at: [100, 92], r: [24, 16, 20], role: "shade", z: 18 },
      { k: "eye", at: [90, 90], r: 6, z: 33 },
      { k: "eye", at: [110, 90], r: 6, z: 33 },
      { k: "ell", at: [100, 132], r: [48, 38, 40], role: "body" },
      { k: "studs", on: { at: [100, 132], r: [48, 38, 40] }, pts: [[80, 120], [120, 120], [84, 148], [116, 148], [100, 106]], size: 7, role: "accent" },
    ],
  },
  sentrowl: {
    turn: 0.2,
    parts: [
      { k: "ext", d: "M70 76 L64 46 L88 66Z", depth: 8, role: "shade", z: -2 },
      { k: "ext", d: "M130 76 L136 46 L112 66Z", depth: 8, role: "shade", z: -2 },
      { k: "ell", at: [100, 118], r: [44, 54, 38], role: "body" },
      { k: "ell", at: [60, 126], r: [13, 34, 15], role: "shade", z: 10, rot: 0.2 },
      { k: "ell", at: [140, 126], r: [13, 34, 15], role: "shade", z: 10, rot: -0.2 },
      { k: "ell", at: [100, 142], r: [26, 26, 11], role: "belly", z: 28 },
      ...[132, 142, 152].map((y) => ({ k: "tube" as const, d: `M90 ${y} L100 ${y + 6} L110 ${y}`, w: 2.2, role: "shade" as const, z: 39 })),
      ...[82, 118].flatMap((x) => [
        { k: "ell" as const, at: [x, 98] as [number, number], r: [18, 18, 7] as [number, number, number], role: "belly" as const, z: 30 },
        { k: "torus" as const, at: [x, 98] as [number, number], R: 18, t: 2.4, role: "accent" as const, z: 32 },
        { k: "ell" as const, at: [x, 98] as [number, number], r: [9, 9, 4] as [number, number, number], role: "eye" as const, z: 36 },
        { k: "ell" as const, at: [x - 3, 94] as [number, number], r: [2.6, 2.6, 2] as [number, number, number], role: "white" as const, z: 40 },
      ]),
      { k: "cone", at: [100, 113], r: 5, h: 11, role: "accent", z: 38, tilt: Math.PI },
      { k: "ell", at: [88, 172], r: [8, 4, 8], role: "accent", z: 14 },
      { k: "ell", at: [112, 172], r: [8, 4, 8], role: "accent", z: 14 },
    ],
  },
  bytenewt: {
    turn: 0.5,
    parts: [
      { k: "ext", d: "M146 134 C176 128 192 140 196 154 C180 150 164 152 146 152Z", depth: 5, role: "shade", z: -2.5 },
      { k: "ell", at: [115, 142], r: [42, 20, 24], role: "body" },
      { k: "ell", at: [114, 152], r: [30, 7, 18], role: "belly", z: 7 },
      { k: "ell", at: [88, 162], r: [6, 8, 6], role: "shade", z: 14 },
      { k: "ell", at: [130, 162], r: [6, 8, 6], role: "shade", z: 14 },
      { k: "ell", at: [102, 162], r: [6, 8, 6], role: "shade", z: -14 },
      { k: "ell", at: [144, 162], r: [6, 8, 6], role: "shade", z: -14 },
      ...["M44 102 L30 92", "M40 112 L24 110", "M42 122 L28 130", "M98 100 L112 88", "M102 110 L118 104", "M100 120 L116 122"].map((d) => ({ k: "tube" as const, d, w: 6, role: "accent" as const, z: 6 })),
      { k: "ell", at: [70, 118], r: [34, 27, 28], role: "body" },
      { k: "eye", at: [57, 113], r: 6, z: 24 },
      { k: "eye", at: [84, 113], r: 6, z: 24 },
      { k: "tube", d: "M63 128 Q71 134 79 128", w: 2.5, role: "eye", z: 27 },
      { k: "ell", at: [50, 126], r: [4, 3, 2], role: "pink", z: 22 },
      { k: "ell", at: [92, 126], r: [4, 3, 2], role: "pink", z: 22 },
    ],
  },
  cipherion: {
    turn: 0.15,
    parts: [
      { k: "ext", d: "M78 110 C50 70 18 72 8 96 C24 98 26 110 20 122 C36 116 44 126 44 138 C58 128 70 130 80 134Z", depth: 4, role: "shade", z: -18 },
      { k: "ext", d: "M122 110 C150 70 182 72 192 96 C176 98 174 110 180 122 C164 116 156 126 156 138 C142 128 130 130 120 134Z", depth: 4, role: "shade", z: -18 },
      ...["M24 96 L76 116", "M30 120 L78 124", "M176 96 L124 116", "M170 120 L122 124"].map((d) => ({ k: "tube" as const, d, w: 2, role: "accent" as const, z: -13 })),
      { k: "tube", d: "M132 156 C164 166 182 150 180 132", w: 12, role: "body", z: -12 },
      { k: "cone", at: [181, 126], r: 6, h: 12, role: "accent", z: -12, tilt: 0.3 },
      { k: "ell", at: [100, 134], r: [40, 36, 34], role: "body" },
      { k: "ell", at: [100, 143], r: [24, 26, 10], role: "belly", z: 27 },
      { k: "ell", at: [100, 134], r: [7, 7, 4], role: "accent", z: 37 },
      { k: "box", at: [100, 145], s: [7, 14, 4], role: "accent", z: 37 },
      { k: "tube", d: "M86 62 C80 46 74 38 66 32", w: 6, role: "accent", z: 2 },
      { k: "tube", d: "M114 62 C120 46 126 38 134 32", w: 6, role: "accent", z: 2 },
      { k: "ell", at: [100, 82], r: [28, 28, 26], role: "body", z: 4 },
      { k: "ell", at: [100, 96], r: [16, 10, 12], role: "belly", z: 26 },
      { k: "ell", at: [95, 95], r: [2, 2, 2], role: "shade", z: 38 },
      { k: "ell", at: [105, 95], r: [2, 2, 2], role: "shade", z: 38 },
      { k: "eye", at: [89, 78], r: 6, z: 26 },
      { k: "eye", at: [111, 78], r: 6, z: 26 },
      { k: "ell", at: [84, 168], r: [11, 6, 10], role: "shade", z: 14 },
      { k: "ell", at: [116, 168], r: [11, 6, 10], role: "shade", z: 14 },
    ],
  },
};
