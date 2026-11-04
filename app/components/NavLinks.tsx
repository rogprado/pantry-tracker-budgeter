"use client";

import { ChefHat, LayoutDashboard, Refrigerator, Settings, ShoppingBasket, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/pantry", label: "Pantry", Icon: Refrigerator },
  { href: "/pantry/staples", label: "Staples", Icon: Star },
  { href: "/recipes", label: "Recipes", Icon: ChefHat },
  { href: "/shopping", label: "Shopping", Icon: ShoppingBasket },
  { href: "/settings", label: "Settings", Icon: Settings },
];

// Sidebar links with a clear active state. The most specific matching link wins,
// so /pantry/staples highlights Staples and /pantry/12 highlights Pantry.
export default function NavLinks() {
  const path = usePathname();
  const active = LINKS.filter((l) => path === l.href || path.startsWith(l.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {LINKS.map(({ href, label, Icon }) => {
        const isActive = href === active;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium transition ${
              isActive ? "bg-lavender text-eggplant" : "text-muted hover:bg-lavender/70 hover:text-eggplant"
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} className={isActive ? "text-plum" : ""} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
