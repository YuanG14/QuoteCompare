"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="workspace-error" role="alert">
      <span className="state-label">Workspace error</span>
      <h1>This view could not be loaded.</h1>
      <p>
        QuoteCompare contained the problem to this area. Retry the view or use the navigation to
        move elsewhere in the workspace.
      </p>
      <Button onClick={reset}>Retry view</Button>
    </section>
  );
}
