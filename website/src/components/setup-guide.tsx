"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, LaptopIcon, TerminalIcon, WindowIcon } from "@/components/icons";
import { platformOrder, platforms, setupGuides, type GuideStep, type GuideTrack } from "@/config/site";
import type { FileVariant, PackageFormat, PlatformId } from "@/lib/downloads/types";

const ICONS = { windows: WindowIcon, macos: LaptopIcon, linux: TerminalIcon } as const;

interface DownloadedFile {
  platform: PlatformId;
  format: PackageFormat;
  variant: FileVariant;
  name: string;
}

function trackMatches(track: GuideTrack, file: DownloadedFile): boolean {
  return track.format === file.format && (track.variant === "portable") === (file.variant === "portable");
}

function fill(text: string, name: string): string {
  return text.replaceAll("{file}", name);
}

function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the command is still selectable on screen.
    }
  };
  return (
    <div className="mt-3 flex items-stretch overflow-hidden rounded-xl border border-line bg-sunken">
      <code role="region" aria-label={`Command: ${command}`} tabIndex={0} className="min-w-0 flex-1 overflow-x-auto px-4 py-3 font-mono text-sm whitespace-pre text-ink">{command}</code>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 border-l border-line px-3.5 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
      >
        {copied ? <CheckIcon className="size-4" /> : null}
        {copied ? "Copied" : "Copy"}
        <span className="sr-only">{copied ? "" : " command"}</span>
      </button>
    </div>
  );
}

function Steps({ steps, fileName }: { steps: readonly GuideStep[]; fileName: string }) {
  return (
    <ol className="space-y-7">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4 sm:gap-5">
          <span aria-hidden="true" className="w-7 shrink-0 font-serif text-3xl leading-none tracking-tight text-accent sm:w-9 sm:text-4xl">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-serif text-lg tracking-tight">
              <span className="sr-only">Step {index + 1}: </span>
              {step.title}
            </p>
            <p className="mt-1.5 max-w-xl text-[0.9375rem] text-pretty text-ink-soft">{fill(step.body, fileName)}</p>
            {step.command && <CopyableCommand command={fill(step.command, fileName)} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Track({ track, file, open }: { track: GuideTrack; file: DownloadedFile | null; open: boolean }) {
  const mine = file !== null && trackMatches(track, file);
  const fileName = mine ? file.name : track.fileFallback;
  return (
    <details open={open} className="group rounded-2xl border border-line bg-bg">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="font-serif text-xl tracking-tight">
          {track.title}
          {mine && <span className="ml-3 align-middle font-sans text-xs tracking-wide text-accent uppercase">Your download</span>}
        </span>
        <span aria-hidden="true" className="text-muted transition-transform duration-200 group-open:rotate-180">
          &#9662;
        </span>
      </summary>
      <div className="border-t border-line px-5 py-6 sm:px-6 sm:py-8">
        <Steps steps={track.steps} fileName={fileName} />
      </div>
    </details>
  );
}

/**
 * Step-by-step setup for each operating system. Opens on the system the visitor
 * just downloaded for, and the section for their exact file comes first.
 */
export function SetupGuide({ file }: { file: DownloadedFile }) {
  const [active, setActive] = useState<PlatformId>(file.platform);
  const baseId = useId();
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = platformOrder.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    const id = platformOrder[next];
    if (!id) return;
    setActive(id);
    tabs.current[id]?.focus();
  };

  const guide = setupGuides[active];
  // The track for the visitor's own file leads; the rest follow, collapsed.
  const tracks = [...guide.tracks].sort((a, b) => {
    const mineA = active === file.platform && trackMatches(a, file);
    const mineB = active === file.platform && trackMatches(b, file);
    return Number(mineB) - Number(mineA);
  });
  const anyMine = active === file.platform && tracks.some((track) => trackMatches(track, file));

  return (
    <div>
      <div role="tablist" aria-label="Operating system" className="grid grid-cols-3 gap-2 sm:gap-3">
        {platformOrder.map((id, index) => {
          const Icon = ICONS[id];
          const selected = id === active;
          return (
            <button
              key={id}
              ref={(element) => {
                tabs.current[id] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-2 text-[0.9375rem] font-medium transition-[border-color,background-color] duration-200 sm:min-h-16 ${
                selected ? "border-ink bg-bg shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line text-ink-soft hover:border-line-strong hover:bg-bg"
              }`}
            >
              <Icon className={`size-5 ${selected ? "text-ink" : "text-muted"}`} />
              {platforms[id].label}
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} tabIndex={0} className="mt-8 rounded-2xl outline-offset-4">
        <p className="max-w-xl text-base text-pretty text-ink-soft">{guide.intro}</p>
        <div className="mt-6 space-y-4">
          {tracks.map((track, index) => (
            <Track
              key={`${active}-${track.id}`}
              track={track}
              file={active === file.platform ? file : null}
              open={anyMine ? trackMatches(track, file) : index === 0}
            />
          ))}
        </div>

        {guide.afterSetup.length > 0 && (
          <div className="mt-8 rounded-2xl border border-line bg-bg p-5 sm:p-6">
            <h3 className="font-serif text-xl tracking-tight">Good to know</h3>
            <ul className="mt-3 space-y-3">
              {guide.afterSetup.map((step) => (
                <li key={step.title}>
                  <p className="font-medium text-ink">{step.title}</p>
                  <p className="mt-0.5 max-w-xl text-[0.9375rem] text-pretty text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
