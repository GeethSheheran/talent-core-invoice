export const dynamic = "force-dynamic";
import Link from "next/link";
import { configured } from "@/lib/env";
import { AuthForm } from "@/components/auth-form";
export default function Login() {
  return (
    <main className="auth card">
      <div className="wordmark">
        <span className="mark">L</span>ledger.
      </div>
      <div className="eyebrow">Your business, in balance</div>
      <h1>Welcome to your workspace</h1>
      <p className="muted">
        Manage proposals, invoices and payments in one private place.
      </p>
      {configured() ? (
        <>
          <AuthForm />
          <p style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/recover">Forgot your password?</Link>
          </p>
        </>
      ) : (
        <>
          <div className="notice">
            <strong>Connect your workspace</strong>
            <p>
              Supabase configuration is needed before administrators can sign
              in.
            </p>
          </div>
          <ol className="checklist">
            <li>
              Copy <code>.env.example</code> to <code>.env.local</code>.
            </li>
            <li>
              Configure a development Supabase project and apply the migrations.
            </li>
            <li>Bootstrap your administrator, then restart the app.</li>
          </ol>
          <p className="muted">
            Follow README.md for the exact setup commands. Your workspace starts
            empty.
          </p>
        </>
      )}
      <p className="muted" style={{ fontSize: 11, marginTop: 28 }}>
        Administrator access only · No client portal
      </p>
    </main>
  );
}
