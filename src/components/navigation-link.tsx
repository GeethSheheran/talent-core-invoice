"use client";
import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="navigation-status" role="status">
      <span className="loading-spinner" aria-hidden="true" />
      <span className="sr-only">Loading page…</span>
    </span>
  ) : null;
}

export default function NavigationLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationStatus />
    </Link>
  );
}
