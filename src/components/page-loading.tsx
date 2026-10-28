export function PageLoading({ label = "Loading page…" }: { label?: string }) {
  return (
    <section className="page-loading" aria-busy="true" aria-label={label}>
      <div className="loading-caption" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        {label}
      </div>
      <div className="loading-skeleton" aria-hidden="true">
        <div className="skeleton-line skeleton-title" />
        <div className="card skeleton-card">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    </section>
  );
}
