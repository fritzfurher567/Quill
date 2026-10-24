import type { ReactNode } from "react";
import { AlertIcon, InfoIcon } from "@/components/icons";

interface NoticeProps {
  tone?: "info" | "problem";
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

/**
 * A status message. Meaning is carried by an icon and the wording, never by
 * colour alone.
 */
export function Notice({ tone = "info", title, children, actions }: NoticeProps) {
  const Icon = tone === "problem" ? AlertIcon : InfoIcon;
  return (
    <div className="fade-up flex gap-3.5 rounded-xl border border-line bg-bg p-4 sm:p-5">
      <Icon className={`mt-0.5 size-5 shrink-0 ${tone === "problem" ? "text-ink" : "text-muted"}`} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{title}</p>
        {children && <div className="mt-1.5 space-y-2 text-[0.9375rem] text-ink-soft">{children}</div>}
        {actions && <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">{actions}</div>}
      </div>
    </div>
  );
}
