import AuthForm from "@/app/components/AuthForm";
import OAuthButtons from "@/app/components/OAuthButtons";
import { login } from "@/app/auth/actions";

const NOTICES: Record<string, string> = {
  confirm: "That confirmation link didn't work. Try logging in, or sign up again.",
  oauth: "That sign-in didn't go through. Please try again, or use your email and password.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const notice = typeof error === "string" ? NOTICES[error] : undefined;
  return <AuthForm mode="login" action={login} notice={notice} oauth={<OAuthButtons />} />;
}
