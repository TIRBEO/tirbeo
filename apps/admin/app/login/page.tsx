'use client';
import React, { useState, useCallback, useId } from 'react';
import { apiFetch } from '../lib';

function IconWrapper({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'inline-flex', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>{children}</span>;
}
function MailIcon() { return <IconWrapper><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></IconWrapper>; }
function LockIcon() { return <IconWrapper><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></IconWrapper>; }
function UserIcon() { return <IconWrapper><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></IconWrapper>; }
function EyeIcon({ off }: { off?: boolean }) { return off ? <IconWrapper><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg></IconWrapper> : <IconWrapper><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></IconWrapper>; }
function ShieldIcon() { return <div style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>; }
function Spinner() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>; }
function AlertCircle() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }

function DeskIllustration() {
  return (
    <svg viewBox="0 0 600 500" style={{ width: '100%', maxWidth: 460, height: 'auto' }}>
      <circle cx="300" cy="250" r="200" fill="url(#g)" opacity="0.6" />
      <defs>
        <linearGradient id="g"><stop offset="0%" stopColor="#E8F0FE" /><stop offset="100%" stopColor="#D4E4FC" /></linearGradient>
      </defs>
    </svg>
  );
}

function FloatingInput({ id, label, type, value, onChange, icon, autoFocus, required }: any) {
  const hasValue = value && value.length > 0;
  return (
    <div className="login-field">
      <div className={`login-input-wrap${hasValue ? ' has-value' : ''}`}>
        <span className="login-input-icon">{icon}</span>
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} autoFocus={autoFocus} required={required} className="login-input" placeholder=" " />
        <label htmlFor={id} className="login-floating-label">{label}</label>
      </div>
    </div>
  );
}

function PasswordInput({ id, label, value, onChange }: any) {
  const [show, setShow] = useState(false);
  const hasValue = value && value.length > 0;
  return (
    <div className="login-field">
      <div className={`login-input-wrap${hasValue ? ' has-value' : ''}`}>
        <span className="login-input-icon"><LockIcon /></span>
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} required minLength={8} className="login-input" placeholder=" " />
        <label htmlFor={id} className="login-floating-label">{label}</label>
        <button type="button" className="login-toggle-vis" onClick={() => setShow(s => !s)} aria-label="Toggle password visibility"><EyeIcon off={!show} /></button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const id = useId();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const handleTilt = (e: React.MouseEvent) => {
    const el = (e.currentTarget as HTMLElement);
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const ry = Math.max(Math.min((dx / rect.width) * 12, 12), -12);
    const rx = Math.max(Math.min((-dy / rect.height) * 8, 8), -8);
    setTilt({ rx, ry });
  };
  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (res.ok) window.location.href = '/'; else setError('Invalid credentials');
    } catch (e) { setError('Network error'); }
    finally { setLoading(false); }
  }, [email, password]);

  const toggleMode = useCallback(() => setMode(m => (m === 'login' ? 'signup' : 'login')), []);

  return (
    <div className="login-wrapper">
      <div className="login-bg-shapes"><div className="login-shape-1" /><div className="login-shape-2" /></div>
      <div className="login-split" style={{ alignItems: 'center' }}>
        <div className="login-illustration"><div className="login-ill-content"><DeskIllustration /><div className="login-ill-text"><h2 className="login-ill-title">Welcome Back</h2><p className="login-ill-desc">Manage your platform, monitor activity, and configure settings.</p></div></div></div>
        <div className="login-panel-wrap">
          <div className="login-panel" onMouseMove={handleTilt} onMouseLeave={resetTilt} style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}>
            <div className="login-panel-shadow" />
            <div className="login-panel-header">
              <div className="login-panel-logo"><div className="login-top-icon"><BrandLogo /></div></div>
              <h1 className="login-panel-title">Sign in with email</h1>
              <p className="login-panel-sub">Make a new doc to bring your words, data, and teams together. For free</p>
            </div>

            {error && <div className="login-error-banner"><AlertCircle />{error}</div>}

            <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
              {mode === 'signup' && <FloatingInput id={`${id}-name`} label="Full Name" type="text" value={name} onChange={setName} icon={<UserIcon />} />}
              <FloatingInput id={`${id}-email`} label="Email Address" type="email" value={email} onChange={setEmail} icon={<MailIcon />} autoFocus required />
              <PasswordInput id={`${id}-password`} label="Password" value={password} onChange={setPassword} />

              <div className="login-options"><label className="login-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /><span className="login-checkbox" /><span>Remember me</span></label><button type="button" className="login-link-btn" tabIndex={-1}>Forgot Password?</button></div>

              <button type="submit" disabled={loading} className="login-btn-primary">{loading ? <><Spinner /> Please wait…</> : 'Get Started'}</button>
            </form>

            <div className="login-divider">Or sign in with</div>
            <div className="social-row">
              <button className="social-btn" aria-label="Sign in with Google"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M21 12.3c0-.7-.1-1.3-.2-1.9H12v3.6h5.6c-.2 1.2-.9 2.3-1.9 3l3 2.4c1.8-1.6 2.8-4 2.8-6.9z" fill="#4285F4"/></svg></button>
              <button className="social-btn" aria-label="Sign in with Facebook"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H19l-.5 3h-2v7A10 10 0 0 0 22 12z" fill="#1877F2"/></svg></button>
              <button className="social-btn" aria-label="Sign in with Apple"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M16.7 7.1c-.5.6-1.1 1.3-1.9 1.3-.8 0-1.3-.5-2-.5-.7 0-1.5.5-2.4.5-2.4 0-4.7-2.3-4.7-5.4 0-1 .3-2 1-2.7 1 .1 2 .6 2.9.6.7 0 1.7-.6 2.8-.6.3 0 1.9.1 3 .9-.1.1-.7.9-1.6 1.9z" fill="#111"/></svg></button>
            </div>

            <div className="login-footer-text">Forgot password? <button type="button" className="login-link-btn">Reset</button></div>

          </div>
        </div>
      </div>

      <style>{`@keyframes login-spin { to { transform: rotate(360deg); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
