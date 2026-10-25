"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, DownloadIcon } from "@/components/icons";

interface AutoDownloadProps {
  name: string;
  url: string;
  /** Pre-formatted size such as "91 MB", or null. */
  size: string | null;
}

/**
 * Starts the download a moment after the page opens, the way most download pages
 * do, and always leaves a plain link so it still works without scripting, or if
 * the browser blocks the automatic start.
 */
export function AutoDownload({ name, url, size }: AutoDownloadProps) {
  const link = useRef<HTMLAnchorElement>(null);
  const started = useRef(false);
  const [state, setState] = useState<"waiting" | "started">("waiting");

  useEffect(() => {
    if (started.current) return;
    const timer = window.setTimeout(() => {
      if (started.current) return;
      started.current = true;
      link.current?.click();
      setState("started");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <p role="status" className="flex items-center gap-2 text-base text-ink-soft sm:text-lg">
        {state === "started" ? (
          <>
            <CheckIcon className="size-5 text-accent" />
            Your download has started.
          </>
        ) : (
          <>Your download will start in a moment…</>
        )}
      </p>
      <a ref={link} href={url} download={name} className="btn btn-secondary">
        <DownloadIcon className="size-4" />
        {state === "started" ? "Didn’t start? Download again" : "Download now"}
        <span className="sr-only">
          : {name}
          {size ? `, ${size}` : ""}
        </span>
      </a>
      <p className="max-w-md text-center text-sm text-muted">
        {name}
        {size ? ` · ${size}` : ""}
      </p>
    </div>
  );
}
