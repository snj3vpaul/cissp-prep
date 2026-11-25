"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Home, Layers, ListChecks, MoreHorizontal } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV, SETTINGS_NAV, isActive } from "@/lib/nav";
import { useAppState, useHydrated } from "@/lib/store";
import { dueCardCount } from "@/lib/derived";
import { layoutStyle, useLayoutPrefs } from "@/lib/layout-prefs";
import { cn } from "@/lib/utils";
import { UnlockWatcher } from "@/components/collection/unlock-watcher";
import { CroissantCoach } from "@/components/coach/croissant-coach";
import { TRACKS, TRACK_ID, switchTrack, type TrackId } from "@/lib/track";

const FLIP_KEY = "cissp-command-center:flipped";

/** Track switch (CISSP · CCSK · CTFL · Performance µ). Flips the page out, swaps track (reload), and flips the new one in. */
function TrackToggle({ className, active }: { className?: string; active: TrackId | null }) {
  const [busy, setBusy] = useState(false);
  const go = (id: TrackId) => {
    if (id === TRACK_ID || busy) return;
    setBusy(true);
    const main = document.getElementById("main");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      sessionStorage.setItem(FLIP_KEY, "1");
    } catch {
      /* ignore */
    }
    if (main && !reduce) {
      main.style.transition = "transform .38s cubic-bezier(.5,0,.75,0), opacity .38s";
      main.style.transformOrigin = "50% 40%";
      main.style.transform = "perspective(1600px) rotateY(88deg)";
      main.style.opacity = "0.2";
      window.setTimeout(() => switchTrack(id), 360);
    } else switchTrack(id);
  };
  return (
    <div role="radiogroup" aria-label="Study track" className={cn("grid grid-cols-2 rounded-xl bg-muted p-1", className)}>
      {(Object.keys(TRACKS) as TrackId[]).map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={active === id}
          onClick={() => go(id)}
          className={cn("h-9 rounded-lg text-sm font-semibold transition-colors", active === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          {TRACKS[id].name}
        </button>
      ))}
    </div>
  );
}

function Sidebar({ name, track }: { name?: string; track: TrackId | null }) {
  const pathname = usePathname();
  return (
    <aside className="z-sidebar z-anim fixed inset-y-0 left-0 hidden w-[var(--sb)] flex-col border-r border-border bg-muted/30 px-3 py-5 lg:flex">
      <Link href="/" className="flex items-center gap-2.5 rounded-lg px-2">
        <LogoMark className="h-7 w-7" />
        <span className="font-display text-[15px] font-semibold">{track ? TRACKS[track].name : "\u00a0"}</span>
      </Link>
      <TrackToggle className="mt-5" active={track} />
      <nav aria-label="Primary" className="mt-5">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-background font-medium text-foreground shadow-sm ring-1 ring-border"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto flex items-center gap-2 px-1">
        <Link href={SETTINGS_NAV.href} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1.5 hover:bg-muted" aria-label="Settings">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
            {(name?.trim()[0] ?? "M").toUpperCase()}
          </span>
          <span className="truncate text-sm">{name?.trim() || "Me"}</span>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quiz", label: "Quiz", icon: ListChecks },
  { href: "/quiz/check", label: "Check", icon: Brain },
  { href: "/flashcards", label: "Cards", icon: Layers },
];

function TabBar({ due, track }: { due: number; track: TrackId | null }) {
  const pathname = usePathname();
  const [moreFor, setMoreFor] = useState<string | null>(null);
  const more = moreFor === pathname;
  const extra = [...NAV.filter((n) => !TABS.some((t) => t.href === n.href)), SETTINGS_NAV];

  return (
    <>
      <AnimatePresence>
        {more && (
          <motion.nav
            aria-label="More"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-border bg-background p-2 shadow-xl lg:hidden"
          >
            <TrackToggle className="mb-2" active={track} />
            <ul className="grid grid-cols-2 gap-1">
              {extra.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="flex h-12 items-center gap-2.5 rounded-xl px-3 text-sm hover:bg-muted">
                    <n.icon className="h-4 w-4 text-muted-foreground" aria-hidden /> {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
      <nav aria-label="Tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="mx-auto flex h-16 max-w-md items-center justify-around">
          {TABS.map((t) => {
            const active = isActive(pathname, t.href);
            return (
              <li key={t.href}>
                <Link href={t.href} aria-label={t.label} aria-current={active ? "page" : undefined} className="relative grid h-12 w-14 place-items-center">
                  <t.icon className={cn("h-6 w-6", active ? "text-foreground" : "text-muted-foreground")} strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                  {t.href === "/" && active && <span aria-hidden className="absolute right-3.5 top-2 h-1.5 w-1.5 rounded-full bg-sky-500" />}
                  {t.href === "/flashcards" && due > 0 && (
                    <span className="absolute right-1.5 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white">
                      {due > 99 ? "99+" : due}
                      <span className="sr-only"> cards due</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-label="More pages"
              aria-expanded={more}
              onClick={() => setMoreFor(more ? null : pathname)}
              className="grid h-12 w-14 place-items-center"
            >
              <MoreHorizontal className={cn("h-6 w-6", more ? "text-foreground" : "text-muted-foreground")} aria-hidden />
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

function MobileTopBar({ track }: { track: TrackId | null }) {
  const pathname = usePathname();
  const current = [...NAV, SETTINGS_NAV].find((n) => isActive(pathname, n.href));
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur lg:hidden">
      <Link href="/" aria-label="Dashboard">
        <LogoMark className="h-7 w-7" />
      </Link>
      <p className="font-display text-base font-semibold">{pathname === "/" || !current ? (track ? TRACKS[track].name : "\u00a0") : current.label}</p>
      <ThemeToggle />
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { prefs, active } = useLayoutPrefs();
  const state = useAppState();
  const hydrated = useHydrated();
  const due = hydrated ? dueCardCount(state) : 0;
  const [flipIn] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const f = sessionStorage.getItem(FLIP_KEY) === "1";
      sessionStorage.removeItem(FLIP_KEY);
      return f;
    } catch {
      return false;
    }
  });

  return (
    <div data-zone={active ?? undefined} style={layoutStyle(prefs.values)} className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <Sidebar name={hydrated ? state.settings.name : undefined} track={hydrated ? TRACK_ID : null} />
      <div className="z-anim min-w-0 lg:pl-[var(--sb)]">
        <MobileTopBar track={hydrated ? TRACK_ID : null} />
        <main id="main" className={cn("pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0", hydrated && flipIn && "track-flip-in")}>
          {/* Track data is read in the browser, so render pages only once hydrated. */}
          {hydrated ? children : <div className="p-6 lg:p-10" aria-busy="true"><div className="h-10 w-48 animate-pulse rounded-xl bg-muted" /><div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" /></div>}
        </main>
      </div>
      <TabBar due={due} track={hydrated ? TRACK_ID : null} />
      <UnlockWatcher />
      {hydrated && TRACK_ID === "cissp" && <CroissantCoach />}
    </div>
  );
}
