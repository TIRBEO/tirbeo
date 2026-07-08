'use client';

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 32, textAlign: 'center',
      background: 'var(--bg-canvas)', color: 'var(--text-primary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
        <h2 style={{ margin: '0 0 8px' }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
          An unexpected error occurred. This has been logged.
        </p>
        {error.digest && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Error ID: {error.digest}
          </p>
        )}
        <button className="btn btn-primary" onClick={reset}>
          Try Again
        </button>
      </div>
    </div>
  );
}
