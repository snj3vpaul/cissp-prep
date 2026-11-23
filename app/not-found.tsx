import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-mono text-sm text-muted-foreground">404 · ACCESS DENIED (by default)</p>
        <h1 className="mt-3 text-4xl font-bold">This page failed securely.</h1>
        <p className="mt-2 text-muted-foreground">The resource you requested doesn’t exist.</p>
        <Button asChild className="mt-6">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
