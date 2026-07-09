'use client';
import React, { useState, useCallback, useId, useRef, useEffect } from 'react';
import { apiFetch } from '../lib';

function ShieldMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D8B36A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(216,179,106,0.08)"/>
      <circle cx="12" cy="12" r="3" stroke="#D8B36A" strokeWidth="1.5"/>
    </svg>
  );
}

function StepItem({ number, text, active, done }: { number: number; text: string; active?: boolean; done?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${active ? 'step-active' : done ? 'step-done' : 'step-idle'}`}>
      <div className={`step-circle ${active ? 'step-circle-active' : done ? 'step-circle-done' : 'step-circle-idle'}`}>
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          String(number).padStart(2, '0')
        )}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-white' : done ? 'text-white/80' : 'text-white/40'}`}>{text}</span>
    </div>
  );
}

function OtpInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const newVal = value.split('');
    newVal[index] = char.slice(-1);
    const joined = newVal.join('');
    onChange(joined);
    if (char && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(paste);
    const nextIndex = Math.min(paste.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  return (
    <div className="otp-row" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="otp-cell"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

function MailIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>; }
function LockIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function UserIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function EyeIcon({ off }: { off?: boolean }) { return off
  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }

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
        <button type="button" className="login-toggle-vis" onClick={() => setShow(s => !s)} aria-label="Toggle visibility"><EyeIcon off={!show} /></button>
      </div>
    </div>
  );
}

function Spinner() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>; }
function AlertIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }

type AuthMode = 'login' | 'signup' | 'otp_verify';

export default function AdminLoginPage() {
  const id = useId();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentStep: number = mode === 'login' ? 1 : mode === 'signup' ? 1 : 2;

  const handleSignupSendOtp = useCallback(async () => {
    setError(''); setLoading(true);
    try {
      const res = await apiFetch('/api/auth/signup-otp/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMode('otp_verify');
      } else {
        const text = await res.text();
        setError(text || 'Failed to send verification code');
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally { setLoading(false); }
  }, [email]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          window.location.href = '/';
        } else {
          const text = await res.text();
          setError(text || (res.status === 401 ? 'Invalid credentials' : `Error ${res.status}`));
        }
      } else if (mode === 'signup') {
        await handleSignupSendOtp();
      } else if (mode === 'otp_verify') {
        const res = await apiFetch('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password, name: name || undefined, otpCode }),
        });
        if (res.ok) {
          window.location.href = '/';
        } else {
          const text = await res.text();
          setError(text || 'Verification failed');
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Network error. Check your API connection.');
    } finally { setLoading(false); }
  }, [email, password, name, otpCode, mode, handleSignupSendOtp]);

  const toggleMode = useCallback(() => {
    if (mode === 'login') { setMode('signup'); setError(''); setOtpCode(''); }
    else if (mode === 'signup') { setMode('login'); setError(''); setOtpCode(''); }
    else { setMode('signup'); setOtpCode(''); setError(''); }
  }, [mode]);

  const switchToLogin = useCallback(() => { setMode('login'); setError(''); setOtpCode(''); }, []);

  return (
    <div className="login-wrapper">
      <div className="login-bg-shapes"><div className="login-shape-1" /><div className="login-shape-2" /></div>
      <div className="login-split">
        {/* Left: Brand + Steps */}
        <div className="login-brand-col">
          <div className="login-brand-content">
            <div className="login-brand-header">
              <ShieldMark size={40} />
              <span className="login-brand-name">Tirbeo</span>
            </div>
            <div className="login-brand-join">
              <h2 className="login-brand-heading">{mode === 'login' ? 'Admin Portal' : 'Join Tirbeo'}</h2>
              <p className="login-brand-sub">
                {mode === 'login'
                  ? 'Sign in to manage your platform.'
                  : 'Follow these steps to activate your admin access.'}
              </p>
            </div>
            <div className="login-steps">
              <StepItem number={1} text="Register your identity" active={currentStep === 1} done={currentStep > 1} />
              <StepItem number={2} text="Verify your email" active={currentStep === 2} done={currentStep > 2} />
              <StepItem number={3} text="Access dashboard" active={currentStep === 3} done={currentStep > 3} />
            </div>
          </div>
        </div>

        {/* Right: Glass form */}
        <div className="login-form-col">
          <div className="login-panel-wrap">
            <div className="login-panel">
              <div className="login-panel-shadow" />
              <div className="login-panel-header">
                <div className="login-panel-logo"><ShieldMark size={36} /></div>
                <h1 className="login-panel-title">
                  {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Verify Email'}
                </h1>
                <p className="login-panel-sub">
                  {mode === 'login' ? 'Sign in to your admin account.' : mode === 'signup' ? 'Enter your details to get started.' : `Enter the code sent to ${email}`}
                </p>
              </div>

              {error && (
                <div className={`login-error-banner ${error.includes('sent') || error.includes('created') ? 'login-success-banner' : ''}`}>
                  <AlertIcon />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
                {mode === 'signup' && (
                  <FloatingInput id={`${id}-name`} label="Full Name" type="text" value={name} onChange={setName} icon={<UserIcon />} />
                )}

                {mode === 'otp_verify' ? (
                  <div className="otp-section">
                    <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                    <p className="otp-hint">
                      Didn&apos;t receive the code?{' '}
                      <button type="button" className="login-link-btn" onClick={handleSignupSendOtp}>Resend</button>
                    </p>
                  </div>
                ) : (
                  <>
                    <FloatingInput id={`${id}-email`} label="Email Address" type="email" value={email} onChange={setEmail} icon={<MailIcon />} autoFocus required />
                    <PasswordInput id={`${id}-password`} label="Password" value={password} onChange={setPassword} />
                  </>
                )}

                <button type="submit" disabled={loading || (mode === 'otp_verify' && otpCode.length < 6)} className="login-btn-primary">
                  {loading ? <><Spinner /> Please wait&hellip;</> : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Send Verification Code' : 'Verify & Create Account'}
                </button>
              </form>

              <div className="login-footer-text">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button type="button" className="login-link-btn" onClick={mode === 'login' ? toggleMode : switchToLogin}>
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
