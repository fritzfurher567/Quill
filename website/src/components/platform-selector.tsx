"use client";

import { LaptopIcon, TerminalIcon, WindowIcon } from "@/components/icons";
import { platformOrder, platforms } from "@/config/site";
import type { PlatformId } from "@/lib/github/types";

const ICONS = { windows: WindowIcon, macos: LaptopIcon, linux: TerminalIcon } as const;

interface PlatformSelectorProps {
  /** The platform currently shown, or null when none has been chosen or detected. */
  value: PlatformId | null;
  /** The platform the browser appears to be running on. A guess, so it is only a hint. */
  detected: PlatformId | null;
  onChange: (platform: PlatformId) => void;
}

/**
 * A native radio group: arrow keys, focus and screen-reader semantics come from
 * the browser. Detection only marks one option "Suggested"; all three stay choosable.
 */
export function PlatformSelector({ value, detected, onChange }: PlatformSelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">Choose your operating system</legend>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {platformOrder.map((id) => {
          const Icon = ICONS[id];
          const selected = value === id;
          return (
            <label key={id} className="relative block cursor-pointer">
              <input
                type="radio"
                name="platform"
                value={id}
                checked={selected}
                onChange={() => onChange(id)}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-[border-color,background-color,box-shadow] duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-(--focus) ${
                  selected ? "border-ink bg-bg shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line hover:border-line-strong hover:bg-bg"
                }`}
              >
                <Icon className={`size-6 ${selected ? "text-ink" : "text-muted"}`} />
                <span className="text-[0.9375rem] font-medium">{platforms[id].label}</span>
                <span className={`text-xs ${detected === id ? "text-accent" : "invisible"}`} aria-hidden={detected !== id}>
                  {detected === id ? "Suggested" : "·"}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
