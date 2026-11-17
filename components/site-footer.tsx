import Link from "next/link";
import { Logo } from "@/components/logo";
import { NAV } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="container grid gap-8 py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-md text-sm text-muted-foreground">
            Independent, free study tool. Not affiliated with or endorsed by ISC2. CISSP® is a registered mark of ISC2, Inc.
            All practice questions are original.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {[...NAV, { href: "/settings", label: "Settings" }].map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        Your progress lives in your browser. No account, no tracking.
      </div>
    </footer>
  );
}
