import { AuthForm } from "@/components/auth-form";
export default function Page() {
  return (
    <main className="auth card">
      <h1>Reset your password</h1>
      <AuthForm mode="recover" />
    </main>
  );
}
