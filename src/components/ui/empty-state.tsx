import { FolderOpen } from "lucide-react";
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
      <div className="empty-icon" aria-hidden="true">
        <FolderOpen size={26} strokeWidth={1.5} />
      </div>
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
