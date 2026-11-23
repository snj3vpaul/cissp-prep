"use client";

import { useAppState, useHydrated } from "@/lib/store";
import { Skeleton } from "@/components/ui/card";
import { useDashboardData } from "@/components/dashboard/data";
import { DesktopDashboard } from "@/components/dashboard/desktop-dashboard";
import { MobileWallet } from "@/components/dashboard/mobile-wallet";

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4 lg:p-10" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

/** Home: a wireframe-clean overview on desktop, a wallet-style card stack on phones. */
export function Dashboard() {
  const state = useAppState();
  const hydrated = useHydrated();
  const d = useDashboardData(state);
  if (!hydrated) return <DashboardSkeleton />;
  return (
    <>
      <DesktopDashboard state={state} d={d} />
      <MobileWallet state={state} d={d} />
    </>
  );
}
