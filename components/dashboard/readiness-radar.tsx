"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { DOMAINS } from "@/lib/domains";
import type { DomainStat } from "@/lib/stats";

export function ReadinessRadar({ stats }: { stats: DomainStat[] }) {
  const data = stats.map((s) => ({ domain: `D${s.domain}`, name: DOMAINS[s.domain - 1].name, readiness: s.readiness, answered: s.attempted }));
  return (
    <div className="h-[280px] w-full" role="img" aria-label={`Domain readiness radar: ${data.map((d) => `${d.name} ${d.readiness}%`).join(", ")}`}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="domain" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "var(--font-geist-mono)" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as (typeof data)[number];
              return (
                <div className="glass rounded-xl px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-muted-foreground">
                    Readiness <span className="font-mono text-foreground">{p.readiness}%</span> · {p.answered} answered
                  </p>
                </div>
              );
            }}
          />
          <Radar dataKey="readiness" stroke="#A78BFA" strokeWidth={2} fill="url(#radarFill)" dot={{ r: 3, fill: "#22D3EE", strokeWidth: 0 }} isAnimationActive />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
