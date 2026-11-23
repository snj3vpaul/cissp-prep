"use client";

import { OutlinePicker } from "@/components/outline/outline-picker";
import { activeOutline } from "@/lib/domains";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Download, Moon, RotateCcw, Sun, Upload, Vibrate, Volume2 } from "lucide-react";
import { actions, useAppState, useHydrated, STATE_VERSION } from "@/lib/store";
import { download } from "@/lib/deck";
import { todayISO } from "@/lib/sm2";
import { QUESTION_BANK_VERSION, QUESTIONS } from "@/data/questions";
import { FLASHCARD_DECK_VERSION, FLASHCARDS } from "@/data/flashcards";
import type { AppState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, Skeleton } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange, label, icon: Icon, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; icon: typeof Sun; hint: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-muted/40 px-4 py-3">
      <span className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
        <span>
          <span className="block text-sm font-medium">{label}</span>
          <span className="block text-xs text-muted-foreground">{hint}</span>
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-muted-foreground/30")}
      >
        <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-6" : "left-1")} />
      </button>
    </label>
  );
}

export function SettingsView() {
  const state = useAppState();
  const hydrated = useHydrated();
  const { resolvedTheme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const s = state.settings;

  if (!hydrated) return <Skeleton className="h-96" />;

  const field = "mt-1 h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm";

  return (
    <div className="grid gap-4 pb-20 lg:grid-cols-2">
      <Card>
        <CardTitle>Study plan</CardTitle>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="text-xs font-medium text-muted-foreground">
              Display name
            </label>
            <input id="name" className={field} value={s.name ?? ""} placeholder="Analyst" maxLength={40} onChange={(e) => actions.updateSettings({ name: e.target.value || undefined })} />
          </div>
          <div>
            <label htmlFor="date" className="text-xs font-medium text-muted-foreground">
              Exam date
            </label>
            <input id="date" type="date" min={todayISO()} className={cn(field, "[color-scheme:light] dark:[color-scheme:dark]")} value={s.examDate ?? ""} onChange={(e) => actions.updateSettings({ examDate: e.target.value || undefined })} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Exam outline</p>
            <OutlinePicker className="mt-1.5" />
          </div>
          <div>
            <label htmlFor="goal" className="text-xs font-medium text-muted-foreground">
              Daily goal (items) — used when no exam date is set
            </label>
            <input id="goal" type="number" min={5} max={300} className={field} value={s.dailyGoal} onChange={(e) => actions.updateSettings({ dailyGoal: Math.max(5, Math.min(300, Number(e.target.value) || 20)) })} />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Experience</CardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            {(["dark", "light"] as const).map((t) => (
              <Button key={t} variant={resolvedTheme === t ? "default" : "outline"} className="flex-1" onClick={() => setTheme(t)} aria-pressed={resolvedTheme === t}>
                {t === "dark" ? <Moon /> : <Sun />} {t === "dark" ? "Dark" : "Light"}
              </Button>
            ))}
          </div>
          <Toggle checked={s.sound} onChange={(v) => actions.updateSettings({ sound: v })} label="Sound effects" icon={Volume2} hint="Soft synthesized tones for flips and answers." />
          <Toggle checked={s.haptics} onChange={(v) => actions.updateSettings({ haptics: v })} label="Haptic feedback" icon={Vibrate} hint="Short vibrations on supported phones." />
          <p className="text-xs text-muted-foreground">Animations follow your system’s “reduce motion” setting automatically.</p>
        </div>
      </Card>

      <Card>
        <CardTitle>Backup & transfer</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Progress lives only in this browser. Export it to move devices or keep a backup.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => download(`cissp-progress-${todayISO()}.json`, JSON.stringify({ format: "cissp-command-center-progress", ...actions.exportState() }, null, 2), "application/json")}>
            <Download /> Export progress
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const data = JSON.parse(await f.text()) as AppState & { format?: string };
                if (!Array.isArray(data.attempts) || typeof data.settings !== "object") throw new Error("bad");
                actions.importState(data);
                setMsg("Progress imported.");
              } catch {
                setMsg("That file isn’t a valid progress export.");
              }
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> Import progress
          </Button>
        </div>
        {msg && (
          <p role="status" className="mt-3 text-sm">
            {msg}
          </p>
        )}
      </Card>

      <Card className="border-red-500/30">
        <CardTitle>Danger zone</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">Erase all answers, card schedules, XP, badges and custom cards. Your settings are kept.</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4 border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400">
              <RotateCcw /> Reset all progress
            </Button>
          </DialogTrigger>
          <DialogContent title="Reset all progress?" description="This can’t be undone. Consider exporting a backup first.">
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  className="bg-none bg-red-600 shadow-none hover:bg-red-700"
                  onClick={() => {
                    actions.reset();
                    setMsg("All progress reset.");
                  }}
                >
                  Yes, reset everything
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      <Card className="lg:col-span-2">
        <CardTitle>About this build</CardTitle>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Question bank</dt>
            <dd className="font-mono">
              v{QUESTION_BANK_VERSION} · {QUESTIONS.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Flashcard deck</dt>
            <dd className="font-mono">
              v{FLASHCARD_DECK_VERSION} · {FLASHCARDS.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Storage schema</dt>
            <dd className="font-mono">v{STATE_VERSION}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Exam outline</dt>
            <dd className="font-mono">ISC2 · {activeOutline().effectiveLabel}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
