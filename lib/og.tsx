/* Shared Open Graph image template (rendered by next/og at build/request time). */
export const OG_SIZE = { width: 1200, height: 630 };

export function OgTemplate({ eyebrow, title, sub, accent = "#8B5CF6" }: { eyebrow: string; title: string; sub: string; accent?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0A0E1A",
        backgroundImage: `radial-gradient(circle at 15% 10%, ${accent}66 0%, transparent 45%), radial-gradient(circle at 90% 30%, #22D3EE44 0%, transparent 40%)`,
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
          <path d="M24 3.5 7.5 9.6v12.1c0 10.4 7 18.9 16.5 22.8 9.5-3.9 16.5-12.4 16.5-22.8V9.6L24 3.5Z" fill="#8B5CF633" stroke="#A78BFA" strokeWidth="2.4" />
          <path d="M24 13v22M24 17h-4.5l-2.5 2.5M24 23h-7M24 29h-4.5l-2.5-2.5" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 14.5c3.2-1.6 7.4-.3 8.2 3 2.7.7 3.6 4 1.8 6 1.6 2.3.3 5.6-2.4 6-.6 2.7-4 4-6.6 2.6" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 30, fontWeight: 700 }}>CISSP Command Center</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 26, color: "#67E8F9", letterSpacing: 4, textTransform: "uppercase" }}>{eyebrow}</span>
        <span style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, marginTop: 16, maxWidth: 1000 }}>{title}</span>
        <span style={{ fontSize: 30, color: "#B8C0D9", marginTop: 20 }}>{sub}</span>
      </div>
      <div style={{ display: "flex", height: 10, width: "100%", borderRadius: 10, background: `linear-gradient(90deg, ${accent}, #22D3EE)` }} />
    </div>
  );
}
