import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { Reveal } from "@/components/landing/reveal";

export function FinalCta() {
  return (
    <section className="pb-24 pt-8">
      <div className="container">
        <Reveal>
          <div className="glow-border relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700/40 via-indigo-900/40 to-cyan-700/30 px-6 py-16 text-center sm:px-12 sm:py-20">
            <div aria-hidden className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
            <div className="relative">
              <LogoMark className="mx-auto h-14 w-14 drop-shadow-[0_0_24px_rgba(139,92,246,0.7)]" />
              <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-bold sm:text-5xl">
                Your exam date is a deadline. <span className="text-gradient">Make it a launch date.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
                Set your date, get a daily pace, and start closing gaps in under a minute. No sign-up required.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Open the Command Center <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/resources">Free study resources</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
