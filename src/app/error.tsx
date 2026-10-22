"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="auth card">
      <h1>Something went wrong</h1>
      <p>
        We could not complete this request. Your saved records are preserved.
      </p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
