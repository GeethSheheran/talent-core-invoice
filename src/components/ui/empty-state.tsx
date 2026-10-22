import Link from "next/link";
export function EmptyState({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{body}</p>
      {href && (
        <Link className="button secondary" href={href}>
          {label || "Create first record"}
        </Link>
      )}
    </div>
  );
}
