import { ArrowDownIcon, DownloadIcon } from "@/components/icons";
import Link from "next/link";
import { AnimatedHeadline } from "@/components/animated-headline";
import { InkSpiral } from "@/components/ink-spiral";
import { Logo } from "@/components/logo-mark";
import { PageIllustration } from "@/components/product-illustrations";
import { WindowFrame } from "@/components/window-frame";
import { DOWNLOAD_PATH, product } from "@/config/site";

export function Hero() {
  const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-28 sm:pt-36">
      <InkSpiral className="-top-24 -right-40 size-[34rem] opacity-[0.045] sm:-right-24 sm:size-[46rem] dark:opacity-[0.06]" />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="enter" style={enter(0)}>
            <Logo markClassName="size-9" wordmarkClassName="text-3xl" />
          </div>

          <div className="mt-8 sm:mt-10">
            <AnimatedHeadline id="hero-title" text={product.tagline} />
          </div>

          <p className="enter mt-6 max-w-xl text-base text-pretty text-ink-soft sm:text-lg" style={enter(5)}>
            {product.heroCopy}
          </p>

          <div className="enter mt-9 flex w-full flex-col items-stretch gap-3 min-[460px]:w-auto min-[460px]:flex-row" style={enter(6)}>
            <Link href={DOWNLOAD_PATH} className="btn btn-primary btn-lg">
              <DownloadIcon className="size-[1.1rem]" />
              Download Quill
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Explore features
              <ArrowDownIcon className="btn-arrow size-[1.1rem]" />
            </a>
          </div>

          <p className="enter mt-5 text-sm text-muted" style={enter(7)}>
            Free and open source · For Windows, macOS and Linux
          </p>
        </div>

        <figure className="enter mx-auto mt-14 max-w-4xl sm:mt-20" style={enter(8)}>
          <div className="float">
            <WindowFrame>
              <PageIllustration animated />
            </WindowFrame>
          </div>
          <figcaption className="mt-4 text-center text-sm text-muted">
            Illustration of a writing view. Not a screenshot of the released app.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
