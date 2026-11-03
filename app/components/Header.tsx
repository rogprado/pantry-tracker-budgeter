import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="border-b border-lavender bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold text-primary">
          Pantry
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <nav className="flex gap-4 font-semibold">
              <Link href="/pantry" className="text-heading hover:text-primary">Pantry</Link>
              <Link href="/pantry/staples" className="text-heading hover:text-primary">Staples</Link>
            </nav>
            <span className="hidden text-gray-600 sm:inline">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="btn-outline">
                Log out
              </button>
            </form>
          </div>
        ) : (
          <nav className="flex gap-3 text-sm font-semibold">
            <Link href="/login" className="text-primary">Log in</Link>
            <Link href="/signup" className="text-primary">Sign up</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
