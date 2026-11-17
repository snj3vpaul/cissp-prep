"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; label: string; accuracy: number | null; answered: number };

export function AccuracyChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="0" strokeOpacity={0.6} />
          <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 70, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
          <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "70% target", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <Tooltip
            cursor={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.4 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="glass rounded-xl px-3 py-2 text-xs shadow-xl">
                  <p className="font-semibold text-foreground">{p.label}</p>
                  <p className="text-muted-foreground">{p.accuracy === null ? "No questions answered" : `${p.accuracy}% accuracy · ${p.answered} answered`}</p>
                </div>
              );
            }}
          />
          <Line type="monotone" dataKey="accuracy" stroke="#8B5CF6" strokeWidth={2} connectNulls dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 2, stroke: "hsl(var(--card))" }} activeDot={{ r: 5 }} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
