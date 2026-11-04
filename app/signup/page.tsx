import AuthForm from "@/app/components/AuthForm";
import OAuthButtons from "@/app/components/OAuthButtons";
import { signup } from "@/app/auth/actions";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} oauth={<OAuthButtons />} />;
}
