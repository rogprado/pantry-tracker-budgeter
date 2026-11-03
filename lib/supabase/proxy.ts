import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/pantry"];
const AUTH_PAGES = ["/login", "/signup"];

// Refreshes the login session on every request and redirects:
// logged-out visitors away from protected pages, logged-in users away from login/signup.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const loggedIn = !!data?.claims;
  const path = request.nextUrl.pathname;

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!loggedIn && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    return redirectTo("/login");
  }
  if (loggedIn && AUTH_PAGES.includes(path)) {
    return redirectTo("/pantry");
  }

  return response;
}
