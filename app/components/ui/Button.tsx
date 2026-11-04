import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-sm hover:bg-primary-strong",
  secondary: "border border-lavender-300 bg-white text-plum hover:border-plum/40 hover:bg-lavender",
  ghost: "text-plum hover:bg-lavender-200/60",
  danger: "bg-expired-ink text-white hover:bg-expired-ink/90",
};
const sizes: Record<Size, string> = { md: "px-4 py-2.5 text-base", sm: "px-3 py-1.5 text-sm" };

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; children: ReactNode; className?: string };

// A <button>, or a link that looks like one when `href` is given.
export function Button({
  variant,
  size,
  icon,
  children,
  className = "",
  ...rest
}: Common & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  icon,
  children,
  className = "",
}: Common & { href: string }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}
