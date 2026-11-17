/** Special (non-domain) quiz modes reachable at /quiz/[slug]. Shared by server pages and client components. */
export const SPECIAL_MODES = {
  quick: { title: "Quick 10", n: 10, time: undefined as number | undefined },
  timed: { title: "Timed 25", n: 25, time: 30 * 60 },
  missed: { title: "Missed review", n: 20, time: undefined as number | undefined },
} as const;
