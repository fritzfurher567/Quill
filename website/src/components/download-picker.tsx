"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DownloadIcon, ExternalIcon } from "@/components/icons";
import { Notice } from "@/components/notice";
import { PlatformSelector } from "@/components/platform-selector";
import { platforms } from "@/config/site";
import { describeArch, describeFormat, matchFiles } from "@/lib/downloads/match";
import type { DownloadFile, DownloadSet, PlatformId } from "@/lib/downloads/types";
import { formatBytes, formatReleaseDate } from "@/lib/format";
import { detectPlatform, refineArchitecture, type Detection } from "@/lib/platform";

export const thanksPath = (file: DownloadFile) => `/download/thanks/${file.id}`;

function fileDetails(file: DownloadFile): string {
  const parts = [describeFormat(file), describeArch(file)];
  const size = formatBytes(file.size);
  if (size) parts.push(size);
  return parts.join(" · ");
}

function Checksum({ sha256 }: { sha256: string }) {
  return (
    <details className="mt-3 text-sm text-muted">
      <summary className="cursor-pointer rounded text-ink-soft hover:text-ink">SHA-256 checksum</summary>
      <p className="mt-2 text-xs">
        Compare this with the checksum of your downloaded file to confirm it arrived intact.
      </p>
      <code className="mt-2 block rounded-lg bg-sunken px-3 py-2 font-mono text-xs break-all text-ink">{sha256}</code>
    </details>
  );
}

function FileCard({ file, primary }: { file: DownloadFile; primary: boolean }) {
  return (
    <li className={`rounded-2xl border p-5 sm:p-6 ${primary ? "border-ink bg-bg" : "border-line bg-bg"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium break-words text-ink">{file.name}</p>
          <p className="mt-1 text-sm text-ink-soft">{fileDetails(file)}</p>
        </div>
        <Link
          href={thanksPath(file)}
          className={`btn shrink-0 ${primary ? "btn-primary btn-lg" : "btn-secondary"}`}
          aria-label={`Download ${file.name}`}
        >
          <DownloadIcon className="size-[1.1rem]" />
          Download
        </Link>
      </div>
      {file.sha256 && <Checksum sha256={file.sha256} />}
    </li>
  );
}

function macHint(platform: PlatformId) {
  if (platform === "macos") {
    return "Not sure which Mac you have? Open the Apple menu and choose About This Mac. If it says Chip followed by Apple M1, M2 or similar, choose Apple silicon. If it says Processor followed by Intel, choose Intel.";
  }
  if (platform === "linux") {
    return "Not sure which one you need? Run uname -m in a terminal. x86_64 means x64, and aarch64 means arm64.";
  }
  return "Not sure which one you need? Check your computer's processor in its system settings.";
}

export function DownloadPicker({ downloads }: { downloads: DownloadSet }) {
  const [detection, setDetection] = useState<Detection | null>(null);
  const [chosen, setChosen] = useState<PlatformId | null>(null);

  useEffect(() => {
    let active = true;
    // Resolves at once when the browser can't say more about the CPU.
    refineArchitecture(navigator, detectPlatform(navigator)).then((refined) => {
      if (active) setDetection(refined);
    });
    return () => {
      active = false;
    };
  }, []);

  const available = useMemo(() => new Set(downloads.files.map((file) => file.platform)), [downloads.files]);
  const detected = detection?.platform ?? null;
  const selected = chosen ?? (detected && available.has(detected) ? detected : null);
  const match = selected ? matchFiles(downloads.files, selected, detection?.arch ?? null) : null;
  const date = formatReleaseDate(downloads.releasedAt);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 text-sm">
        <dl className="flex gap-x-10">
          <div>
            <dt className="text-muted">Version</dt>
            <dd className="mt-0.5 font-medium text-ink">{downloads.version}</dd>
          </div>
          {date && (
            <div>
              <dt className="text-muted">Released</dt>
              <dd className="mt-0.5 font-medium text-ink">{date}</dd>
            </div>
          )}
        </dl>
        {downloads.notesUrl && (
          <a href={downloads.notesUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
            Release notes
            <ExternalIcon className="size-3.5" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>

      <div className="mt-8">
        <PlatformSelector value={selected} detected={detected} onChange={setChosen} />
      </div>

      <div className="mt-8" aria-live="polite">
        {detection?.mobile && (
          <Notice title="Quill is made for computers">
            <p>Open this page on your Windows, macOS or Linux computer to download it. You can still look at the downloads below.</p>
          </Notice>
        )}

        {!selected && !detection?.mobile && (
          <p className="text-[0.9375rem] text-ink-soft">
            {detection ? "Choose your operating system to see the right download." : "Looking for the right download for your computer…"}
          </p>
        )}

        {selected && match && match.files.length === 0 && (
          <Notice title={`There's no ${platforms[selected].label} download yet`}>
            <p>Quill isn&rsquo;t available for {platforms[selected].label} in this version. Choose another system above.</p>
          </Notice>
        )}

        {selected && match && match.files.length > 0 && (
          <div className="fade-up space-y-6">
            {match.recommended ? (
              <div>
                <h2 className="text-sm font-medium tracking-wide text-muted uppercase">Right for your {platforms[selected].label} computer</h2>
                <ul className="mt-3">
                  <FileCard file={match.recommended} primary />
                </ul>
              </div>
            ) : (
              <Notice title={`Which ${platforms[selected].label} computer do you have?`}>
                <p>
                  Your browser doesn&rsquo;t tell us, and the wrong build won&rsquo;t run, so choose the one that matches your computer below.
                </p>
                <p>{macHint(selected)}</p>
              </Notice>
            )}

            {(() => {
              const others = match.files.filter((file) => file !== match.recommended);
              if (others.length === 0) return null;
              return (
                <div>
                  <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
                    {match.recommended ? `Other ${platforms[selected].label} downloads` : `${platforms[selected].label} downloads`}
                  </h2>
                  <ul className="mt-3 space-y-3">
                    {others.map((file) => (
                      <FileCard key={file.id} file={file} primary={false} />
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
