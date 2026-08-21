"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="state-screen">
      <div className="state-card">
        <span className="state-label">Something went wrong</span>
        <h1>QuoteCompare could not load this view.</h1>
        <p>The error was contained. You can retry without losing the rest of the workspace.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
