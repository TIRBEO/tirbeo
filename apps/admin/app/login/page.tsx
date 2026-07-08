'use client';
import React, { useState, useCallback, useId } from 'react';
import { apiFetch } from '../lib';

function MailIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function LockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function UserIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function EyeIcon({ off }: { off?: boolean }) {
  return off
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function ShieldIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function Spinner() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'login-spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function AlertCircle() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

/* ─── Desktop SVG Illustration ─── */
function DeskIllustration() {
  return (
    <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 500, height: 'auto' }}>
      <defs>
        <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--login-ill-bg-1, #E8F0FE)"/>
          <stop offset="100%" stopColor="var(--login-ill-bg-2, #D4E4FC)"/>
        </linearGradient>
        <linearGradient id="desk-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0C8D4"/>
          <stop offset="100%" stopColor="#A8B2C0"/>
        </linearGradient>
        <linearGradient id="screen-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A90E2"/>
          <stop offset="100%" stopColor="#357ABD"/>
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.08"/>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="300" cy="250" r="200" fill="url(#bg-grad)" opacity="0.6"/>

      {/* Desk */}
      <rect x="100" y="340" width="400" height="16" rx="4" fill="url(#desk-grad)" filter="url(#shadow)"/>
      <rect x="110" y="356" width="16" height="60" rx="2" fill="#B0BAC8"/>
      <rect x="474" y="356" width="16" height="60" rx="2" fill="#B0BAC8"/>

      {/* Laptop base */}
      <path d="M160 340 L180 310 L420 310 L440 340 Z" fill="#D0D8E4" filter="url(#shadow)"/>

      {/* Laptop screen */}
      <rect x="185" y="175" width="230" height="135" rx="6" fill="url(#screen-grad)"/>

      {/* Screen content */}
      <rect x="200" y="190" width="80" height="6" rx="3" fill="rgba(255,255,255,0.25)"/>
      <rect x="200" y="205" width="200" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="200" y="218" width="180" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="200" y="231" width="190" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="200" y="248" width="160" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="200" y="261" width="170" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="200" y="274" width="140" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      <rect x="330" y="190" width="70" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>

      {/* Coffee cup */}
      <rect x="435" y="310" width="24" height="28" rx="3" fill="#D0D8E4"/>
      <path d="M459 318 C468 318 468 330 459 330" stroke="#D0D8E4" strokeWidth="2.5" fill="none"/>
      <ellipse cx="447" cy="310" rx="12" ry="3" fill="#B8C4D4"/>

      {/* Steam */}
      <path d="M440 300 Q442 292 440 284" stroke="rgba(200,200,220,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M448 298 Q450 290 448 282" stroke="rgba(200,200,220,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M454 300 Q456 292 454 286" stroke="rgba(200,200,220,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Person - body */}
      <ellipse cx="300" cy="300" rx="30" ry="35" fill="#E8EDF5"/>

      {/* Person - head */}
      <circle cx="300" cy="255" r="25" fill="#F0E6D3"/>

      {/* Person - hair */}
      <path d="M275 252 C275 230 325 230 325 252" fill="#5C4B3A"/>
      <path d="M275 252 C270 245 275 238 285 235" fill="#5C4B3A"/>

      {/* Person - face details */}
      <circle cx="291" cy="253" r="2" fill="#8B7D6B"/>
      <circle cx="309" cy="253" r="2" fill="#8B7D6B"/>
      <path d="M293 263 Q300 268 307 263" stroke="#C4A882" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Person - arm left (typing) */}
      <path d="M275 285 C250 295 220 310 210 315" stroke="#F0E6D3" strokeWidth="10" strokeLinecap="round" fill="none"/>

      {/* Person - arm right (typing) */}
      <path d="M325 285 C345 295 370 310 385 315" stroke="#F0E6D3" strokeWidth="10" strokeLinecap="round" fill="none"/>

      {/* Person - shirt */}
      <path d="M280 280 L290 270 L310 270 L320 280 L325 320 L275 320 Z" fill="#4A90E2" opacity="0.8"/>

      {/* Chart on wall */}
      <rect x="125" y="165" width="60" height="45" rx="4" fill="rgba(74,144,226,0.12)" stroke="rgba(74,144,226,0.2)" strokeWidth="1"/>
      <rect x="133" y="195" width="8" height="10" rx="1" fill="#4A90E2" opacity="0.4"/>
      <rect x="145" y="188" width="8" height="17" rx="1" fill="#4A90E2" opacity="0.6"/>
      <rect x="157" y="182" width="8" height="23" rx="1" fill="#4A90E2" opacity="0.8"/>
      <rect x="169" y="178" width="8" height="27" rx="1" fill="#4A90E2"/>

      {/* Small plant */}
      <rect x="455" y="295" width="18" height="20" rx="2" fill="#B8C4D4"/>
      <circle cx="464" cy="288" r="8" fill="#6BBF59" opacity="0.7"/>
      <circle cx="459" cy="284" r="6" fill="#7DCE6B" opacity="0.8"/>
      <circle cx="469" cy="283" r="5" fill="#5DAF4E" opacity="0.7"/>
    </svg>
  );
}

/* ─── Floating label input ─── */
function FloatingInput({ id, label, type, value, onChange, icon, error, autoFocus: af, required }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode;
  error?: string; autoFocus?: boolean; required?: boolean;
}) {
  const hasValue = value.length > 0;
  return (
    <div className="login-field">
      <div className={`login-input-wrap${error ? ' has-error' : ''}${hasValue ? ' has-value' : ''}`}>
        <span className="login-input-icon">{icon}</span>
        <input
          id={id} type={type} value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus={af} required={required}
          aria-label={label} aria-invalid={!!error}
          className="login-input"
          placeholder=" "
        />
        <label htmlFor={id} className="login-floating-label">{label}</label>
      </div>
      {error && <p className="login-field-error"><AlertCircle />{error}</p>}
    </div>
  );
}

/* ─── Password input with toggle ─── */
function PasswordInput({ id, label, value, onChange, error, autoFocus: af }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; error?: string; autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  const hasValue = value.length > 0;
  return (
    <div className="login-field">
      <div className={`login-input-wrap${error ? ' has-error' : ''}${hasValue ? ' has-value' : ''}`}>
        <span className="login-input-icon"><LockIcon /></span>
        <input
          id={id} type={show ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus={af} required minLength={8}
          aria-label={label} aria-invalid={!!error}
          className="login-input"
          placeholder=" "
        />
        <label htmlFor={id} className="login-floating-label">{label}</label>
        <button type="button" className="login-toggle-vis" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} tabIndex={-1}>
          <EyeIcon off={!show} />
        </button>
      </div>
      {error && <p className="login-field-error"><AlertCircle />{error}</p>}
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [needs2FA, setNeeds2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const emailError = touched.email && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : '';
  const passwordError = touched.password && password.length > 0 && password.length < 8 ? 'Password must be at least 8 characters' : '';
  const nameError = mode === 'signup' && touched.name && name.length === 0 ? 'Name is required' : '';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, name: true });
    if (emailError || passwordError || nameError) return;
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body: Record<string, string> = { email, password };
      if (mode === 'signup') body.name = name || email.split('@')[0];

      const res = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });

      if (mode === 'login') {
        const data = await res.json();
        if (data.needs2FA) {
          setNeeds2FA(true);
          setTempToken(data.tempToken);
          return;
        }
      }
      window.location.href = '/';
    } catch {
      setError(mode === 'login' ? 'Invalid email or password' : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, name, mode, emailError, passwordError, nameError]);

  const handle2faSubmit = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint = useRecovery ? '/api/auth/recovery-2fa' : '/api/auth/verify-2fa';
      const body = useRecovery ? { tempToken, recoveryCode } : { tempToken, token: totpCode };
      const res = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
      if (!res.ok) { const t = await res.text(); throw new Error(t || 'Verification failed'); }
      window.location.href = '/';
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }, [tempToken, totpCode, useRecovery, recoveryCode]);

  const toggleMode = useCallback(() => {
    setMode(m => (m === 'login' ? 'signup' : 'login'));
    setError(''); setNeeds2FA(false); setTotpCode(''); setTempToken('');
    setUseRecovery(false); setRecoveryCode(''); setTouched({});
  }, []);

  const blur = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const inputProps = (field: string) => ({
    onBlur: () => blur(field),
  });

  // ─── 2FA Screen ───
  if (needs2FA) {
    return (
      <div className="login-wrapper">
        <div className="login-split">
          <div className="login-illustration">
            <div className="login-ill-content">
              <div className="login-ill-badge"><ShieldIcon /></div>
              <h2 className="login-ill-title">Two-Factor Authentication</h2>
              <p className="login-ill-desc">Extra security, one step away</p>
            </div>
          </div>
          <div className="login-panel-wrap">
            <div className="login-panel">
              <div className="login-panel-header">
                <div className="login-panel-logo"><ShieldIcon /></div>
                <h1 className="login-panel-title">Verify Your Identity</h1>
                <p className="login-panel-sub">
                  {useRecovery ? 'Enter one of your recovery codes' : 'Enter the 6-digit code from your authenticator app'}
                </p>
              </div>
              {error && (
                <div className="login-error-banner"><AlertCircle />{error}</div>
              )}
              <form onSubmit={e => { e.preventDefault(); handle2faSubmit(); }} style={{ width: '100%' }}>
                {!useRecovery ? (
                  <div style={{ marginBottom: 20 }}>
                    <input
                      type="text" placeholder="000000" maxLength={6} value={totpCode}
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      autoFocus aria-label="Authentication code"
                      className="login-otp-input"
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: 20 }}>
                    <input
                      type="text" placeholder="XXXX-XXXX-XXXX-XXXX" value={recoveryCode}
                      onChange={e => setRecoveryCode(e.target.value)} autoFocus
                      aria-label="Recovery code"
                      className="login-input" style={{ textAlign: 'center', letterSpacing: 2, fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                )}
                <button type="submit" disabled={loading || (!useRecovery && totpCode.length !== 6) || (useRecovery && !recoveryCode)} className="login-btn-primary">
                  {loading ? <><Spinner /> Verifying…</> : 'Verify'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" onClick={() => { setUseRecovery(!useRecovery); setError(''); setTotpCode(''); setRecoveryCode(''); }} className="login-link-btn">
                  {useRecovery ? 'Use authenticator app instead' : 'Use a recovery code instead'}
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button type="button" onClick={() => { setNeeds2FA(false); setTotpCode(''); setTempToken(''); setUseRecovery(false); setRecoveryCode(''); }} className="login-link-btn" style={{ color: 'var(--text-muted)' }}>
                  ← Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Login Screen ───
  return (
    <div className="login-wrapper">
      <div className="login-bg-shapes">
        <div className="login-shape-1" />
        <div className="login-shape-2" />
      </div>
      <div className="login-split">
        {/* Left — Illustration */}
        <div className="login-illustration">
          <div className="login-ill-content">
            <DeskIllustration />
            <div className="login-ill-text">
              <h2 className="login-ill-title">Welcome Back</h2>
              <p className="login-ill-desc">Sign in to manage your platform, monitor activity, and configure settings.</p>
            </div>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="login-panel-wrap">
          <div className="login-panel">
            <div className="login-panel-header">
              <div className="login-panel-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h1 className="login-panel-title">{mode === 'login' ? 'Login' : 'Create Account'}</h1>
              <p className="login-panel-sub">
                {mode === 'login' ? 'Enter your credentials to access the dashboard' : 'Sign up for an admin account'}
              </p>
            </div>

            {error && (
              <div className="login-error-banner"><AlertCircle />{error}</div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
              {mode === 'signup' && (
                <FloatingInput
                  id={`${id}-name`} label="Full Name" type="text"
                  value={name} onChange={setName}
                  icon={<UserIcon />}
                  error={touched.name ? nameError : ''}
                  {...inputProps('name')}
                />
              )}

              <FloatingInput
                id={`${id}-email`} label="Email Address" type="email"
                value={email} onChange={setEmail}
                icon={<MailIcon />}
                error={touched.email ? emailError : ''}
                autoFocus required
                {...inputProps('email')}
              />

              <PasswordInput
                id={`${id}-password`} label="Password"
                value={password} onChange={setPassword}
                error={touched.password ? passwordError : ''}
                {...inputProps('password')}
              />

              <div className="login-options">
                <label className="login-remember">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span className="login-checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="login-link-btn" tabIndex={-1}>Forgot Password?</button>
              </div>

              <button type="submit" disabled={loading} className="login-btn-primary">
                {loading ? <><Spinner /> Please wait…</> : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="login-footer-text">
              {mode === 'login' ? (
                <>Don&apos;t have an account? <button type="button" onClick={toggleMode} className="login-link-btn">Get Started for Free</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={toggleMode} className="login-link-btn">Sign in</button></>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes login-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
