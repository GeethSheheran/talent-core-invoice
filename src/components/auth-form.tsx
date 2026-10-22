"use client";
import { useActionState } from "react";
import { login, recover, resetPassword } from "@/app/(auth)/login/actions";
export function AuthForm({
  mode = "login",
}: {
  mode?: "login" | "recover" | "reset";
}) {
  const [message, action, pending] = useActionState(
    mode === "recover" ? recover : mode === "reset" ? resetPassword : login,
    "",
  );
  return (
    <form action={action}>
      {mode !== "reset" && (
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
      )}
      {mode !== "recover" && (
        <div className="field">
          <label htmlFor="password">
            {mode === "reset" ? "New password" : "Password"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "reset" ? "new-password" : "current-password"
            }
            minLength={mode === "reset" ? 12 : 8}
            required
          />
        </div>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <button disabled={pending}>
        {pending
          ? "Please wait…"
          : mode === "recover"
            ? "Send recovery link"
            : mode === "reset"
              ? "Update password"
              : "Sign in to workspace"}
      </button>
    </form>
  );
}
