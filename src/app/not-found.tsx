import Link from "next/link";
export default function NotFound() {
  return (
    <main className="auth card">
      <h1>Record not found</h1>
      <p>The requested page or record is unavailable.</p>
      <Link className="button" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
