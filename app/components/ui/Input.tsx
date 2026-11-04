import type { ComponentProps, ReactNode } from "react";

const control =
  "mt-1.5 block w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/15";
const ok = "border-lavender-300";
const bad = "border-expired-ink/60";

// A label, the control, and either an error (with an icon) or a help line under it.
export function Field({ label, htmlFor, error, help, children }: { label: ReactNode; htmlFor?: string; error?: string; help?: ReactNode; children: ReactNode }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="text-sm font-bold text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-expired-ink">
          <span aria-hidden="true">⚠</span>
          {error}
        </span>
      ) : (
        help && <span className="mt-1.5 block text-sm text-muted">{help}</span>
      )}
    </label>
  );
}

export function Input({ invalid, className = "", ...rest }: { invalid?: boolean } & ComponentProps<"input">) {
  return <input className={`${control} ${invalid ? bad : ok} ${className}`} aria-invalid={invalid || undefined} {...rest} />;
}

export function Select({ invalid, className = "", children, ...rest }: { invalid?: boolean } & ComponentProps<"select">) {
  return (
    <select className={`${control} ${invalid ? bad : ok} ${className}`} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  );
}
