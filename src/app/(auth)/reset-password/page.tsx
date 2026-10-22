import { AuthForm } from "@/components/auth-form";
export default function Page() {
  return (
    <main className="auth card">
      <h1>Choose a new password</h1>
      <AuthForm mode="reset" />
    </main>
  );
}
