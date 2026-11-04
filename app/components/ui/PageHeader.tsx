import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

type Props = { eyebrow?: string; title: string; subtitle?: ReactNode; actions?: ReactNode; image?: StaticImageData; imageAlt?: string };

// Page title in soft Fraunces, a friendly line under it, and actions on the right.
// With an `image`, it becomes a bright banner with the photo on the right.
export function PageHeader({ eyebrow, title, subtitle, actions, image, imageAlt = "" }: Props) {
  const text = (
    <div className="min-w-0">
      {eyebrow && <p className="mb-1 text-sm font-bold tracking-wide text-plum">{eyebrow}</p>}
      <h1 className="font-display text-4xl font-semibold text-eggplant">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-base text-muted">{subtitle}</p>}
      {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
    </div>
  );

  if (!image) {
    return (
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-sm font-bold tracking-wide text-plum">{eyebrow}</p>}
          <h1 className="font-display text-4xl font-semibold text-eggplant">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-base text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </header>
    );
  }

  return (
    <header className="mb-8 grid overflow-hidden rounded-card border border-lavender-200/70 bg-white shadow-card md:grid-cols-[1.25fr_1fr]">
      <div className="flex items-center p-8 lg:p-10">{text}</div>
      <div className="relative min-h-44 md:min-h-full">
        <Image src={image} alt={imageAlt} fill placeholder="blur" sizes="(min-width: 768px) 440px, 100vw" className="object-cover" priority />
      </div>
    </header>
  );
}
