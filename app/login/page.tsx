import AuthForm from "@/app/components/AuthForm";
import { login } from "@/app/auth/actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const notice =
    error === "confirm" ? "That confirmation link didn't work. Try logging in, or sign up again." : undefined;
  return <AuthForm mode="login" action={login} notice={notice} />;
}
