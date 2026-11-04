import { ChefHat, LogOut, PiggyBank, Refrigerator } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { LogoMark } from "@/app/components/Logo";
import NavLinks from "@/app/components/NavLinks";
import { createClient } from "@/lib/supabase/server";

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <LogoMark size={34} />
      <span className="font-display text-[1.6rem] leading-none font-medium text-eggplant">Pantry</span>
    </Link>
  );
}

const shell =
  "border-b border-lavender-200 bg-white lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0";
const inner = "flex flex-col gap-4 p-4 lg:sticky lg:top-0 lg:h-screen lg:gap-8 lg:px-5 lg:py-7";

const PITCH = [
  { Icon: Refrigerator, title: "Know your shelves", body: "Everything you have, and what to use first." },
  { Icon: ChefHat, title: "Cook from what you have", body: "Recipe ideas built from your pantry." },
  { Icon: PiggyBank, title: "Shop on budget", body: "A smart list that fits what's left." },
];

// The same left column for everyone: navigation when logged in,
// a short "what Pantry does" panel when logged out (login and sign-up).
export default async function Sidebar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <aside className={shell}>
        <div className={inner}>
          <BrandMark />
          <ul className="hidden space-y-6 lg:block">
            {PITCH.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <Icon size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-plum" aria-hidden="true" />
                <div>
                  <p className="text-[15px] font-medium text-ink">{title}</p>
                  <p className="text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="hidden text-sm text-muted lg:mt-auto lg:block">Made for home cooks.</p>
        </div>
      </aside>
    );
  }

  const email = data.user.email ?? "";
  return (
    <aside className={shell}>
      <div className={inner}>
        <BrandMark />
        <NavLinks />
        <div className="hidden border-t border-lavender-200 pt-4 lg:mt-auto lg:block">
          <p className="truncate text-sm text-muted" title={email}>
            {email}
          </p>
          <form action={logout} className="mt-2">
            <button type="submit" className="flex items-center gap-2 rounded-md py-1 text-sm font-medium text-plum hover:text-eggplant">
              <LogOut size={16} aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
        {/* Narrow screens: log out sits after the links */}
        <form action={logout} className="lg:hidden">
          <button type="submit" className="flex items-center gap-2 text-sm font-medium text-plum">
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
