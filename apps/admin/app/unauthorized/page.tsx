import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="login-wrapper">
      <div className="login-bg-shapes">
        <div className="login-shape-1" />
        <div className="login-shape-2" />
      </div>
      <div className="login-split" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="login-panel" style={{ maxWidth: 400, textAlign: 'center', alignItems: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--danger-subtle)', fontSize: 24, color: 'var(--danger)',
          }}>
            &#9888;
          </div>
          <h1 className="login-panel-title" style={{ fontSize: 20, marginBottom: 8 }}>Access Denied</h1>
          <p className="login-panel-sub" style={{ marginBottom: 24 }}>
            You do not have permission to access this panel.
          </p>
          <Link href="/login" className="login-btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
