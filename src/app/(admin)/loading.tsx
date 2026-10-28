export default function Loading() {
  return (
    <div role="status" aria-label="Loading your workspace" aria-busy="true">
      <p className="loading-label">
        <span className="loading-dot" aria-hidden="true" />
        Loading your workspace…
      </p>
      <div className="stats" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => (
          <div className="stat" key={item}>
            <div className="skeleton" />
            <div className="skeleton large" />
            <div className="skeleton" />
          </div>
        ))}
      </div>
      <div className="card" aria-hidden="true">
        <div className="skeleton" />
        <div className="skeleton large" />
        <div className="skeleton" />
      </div>
    </div>
  );
}
