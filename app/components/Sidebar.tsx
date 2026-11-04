import { LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import NavLinks from "@/app/components/NavLinks";
import { createClient } from "@/lib/supabase/server";

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-eggplant text-xl" aria-hidden="true">
        🍆
      </span>
      <span className="font-display text-2xl font-semibold text-eggplant">Pantry</span>
    </Link>
  );
}

// Left sidebar on laptops; a top bar with scrollable links on narrow screens. Hidden when logged out.
export default async function Sidebar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const email = data.user.email ?? "";

  return (
    <aside className="border-b border-lavender-200 bg-lavender-200/40 lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-4 p-4 lg:sticky lg:top-0 lg:h-screen lg:gap-8 lg:p-6">
        <BrandMark />
        <NavLinks />
        <div className="hidden border-t border-lavender-300/70 pt-4 lg:mt-auto lg:block">
          <p className="truncate text-sm text-muted" title={email}>
            {email}
          </p>
          <form action={logout} className="mt-2">
            <button type="submit" className="flex items-center gap-2 rounded-lg py-1.5 text-sm font-bold text-plum hover:text-eggplant">
              <LogOut size={16} aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
        {/* Narrow screens: log out sits after the links */}
        <form action={logout} className="lg:hidden">
          <button type="submit" className="flex items-center gap-2 text-sm font-bold text-plum">
            <LogOut size={16} aria-hidden="true" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
