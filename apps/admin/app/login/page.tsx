'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { apiFetch } from '../lib';

/* ─── Inline style helper ─── */
const s = {
  page: { display: 'flex', minHeight: '100vh', width: '100%', background: '#0B0B0D', color: '#F2EEE8', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' },
  leftCol: { display: 'none', position: 'relative' as const, flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'flex-end', padding: '0 48px 128px', width: '52%', overflow: 'hidden' } as React.CSSProperties,
  video: { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const },
  overlay: { position: 'relative' as const, zIndex: 10, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column' as const, gap: 32 },
  rightCol: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '48px 16px', minHeight: '100vh' } as React.CSSProperties,
  formWrap: { width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column' as const, gap: 32 },
  heading: { fontSize: 30, fontWeight: 500, letterSpacing: '-0.03em', color: '#F2EEE8' },
  sub: { fontSize: 14, color: 'rgba(242,238,232,0.4)', marginTop: 4 },
  inputWrap: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  label: { fontSize: 14, fontWeight: 500, color: '#F2EEE8' },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, height: 44, padding: '0 16px', color: '#F2EEE8', fontSize: 14, outline: 'none' } as React.CSSProperties,
  btn: { width: '100%', height: 56, background: '#F2EEE8', color: '#0B0B0D', fontWeight: 600, borderRadius: 12, border: 'none', fontSize: 16, cursor: 'pointer', transition: 'all 0.2s', marginTop: 16 } as React.CSSProperties,
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' } as React.CSSProperties,
  error: { fontSize: 14, color: '#da3633', background: 'rgba(218,54,51,0.1)', borderRadius: 8, padding: '8px 12px' },
  success: { fontSize: 14, color: '#238636', background: 'rgba(35,134,54,0.1)', borderRadius: 8, padding: '8px 12px' },
  link: { color: 'rgba(242,238,232,0.6)', fontSize: 14, textAlign: 'center' as const, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' } as React.CSSProperties,
  otpRow: { display: 'flex', gap: 12, justifyContent: 'center', width: '100%' },
  otpCell: { width: 48, height: 56, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#F2EEE8', fontSize: 20, fontWeight: 500, textAlign: 'center' as const, outline: 'none' } as React.CSSProperties,
};

function ShieldMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F2EEE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(242,238,232,0.08)"/>
      <circle cx="12" cy="12" r="3" stroke="#F2EEE8" strokeWidth="1.5"/>
    </svg>
  );
}

function StepItem({ number, text, active, done }: { number: number; text: string; active?: boolean; done?: boolean }) {
  const bg = active ? '#F2EEE8' : done ? 'rgba(242,238,232,0.1)' : 'rgba(242,238,232,0.03)';
  const color = active ? '#0B0B0D' : done ? 'rgba(242,238,232,0.8)' : 'rgba(242,238,232,0.4)';
  const circleBg = active ? '#0B0B0D' : done ? 'rgba(242,238,232,0.2)' : 'rgba(242,238,232,0.1)';
  const circleColor = active ? '#F2EEE8' : done ? '#F2EEE8' : 'rgba(242,238,232,0.4)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: bg, border: active ? '1px solid #F2EEE8' : 'none', transition: 'all 0.3s' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, background: circleBg, color: circleColor }}>
        {done ? '✓' : String(number).padStart(2, '0')}
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color }}>{text}</span>
    </div>
  );
}

function OtpInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const newVal = value.split(''); newVal[index] = char.slice(-1);
    onChange(newVal.join(''));
    if (char && index < length - 1) inputs.current[index + 1]?.focus();
  };
  const handleKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) inputs.current[index - 1]?.focus();
  };
  useEffect(() => { inputs.current[0]?.focus(); }, []);
  return (
    <div style={s.otpRow}>
      {Array.from({ length }, (_, i) => (
        <input key={i} ref={(el) => { inputs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ''} onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)} style={s.otpCell} autoComplete="one-time-code" />
      ))}
    </div>
  );
}

function Spinner() {
  return <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}

type AuthMode = 'login' | 'signup' | 'otp_verify';

export default function AdminLoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentStep = mode === 'login' ? 1 : mode === 'signup' ? 1 : 2;

  const handleSignupSendOtp = useCallback(async () => {
    setError(''); setLoading(true);
    try {
      const res = await apiFetch('/api/auth/signup-otp/request', { method: 'POST', body: JSON.stringify({ email }) });
      if (res.ok) setMode('otp_verify');
      else setError(await res.text() || 'Failed to send code');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }, [email]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (res.ok) window.location.href = '/';
        else setError(await res.text() || 'Invalid credentials');
      } else if (mode === 'signup') {
        await handleSignupSendOtp();
      } else if (mode === 'otp_verify') {
        const res = await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name: name || undefined, otpCode }) });
        if (res.ok) window.location.href = '/';
        else setError(await res.text() || 'Verification failed');
      }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  }, [email, password, name, otpCode, mode, handleSignupSendOtp]);

  return (
    <div style={s.page}>
      {/* Left: Brand + Steps */}
      <div className="login-left-col" style={s.leftCol}>
        <video autoPlay muted loop playsInline style={s.video}>
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>
        <div style={s.overlay}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ ...s.heading, fontSize: 36, whiteSpace: 'nowrap' }}>
              {mode === 'login' ? 'Admin Portal' : 'Join Tirbeo'}
            </h2>
            <p style={s.sub}>
              {mode === 'login' ? 'Sign in to manage your platform.' : 'Follow these steps to activate your admin access.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StepItem number={1} text="Register your identity" active={currentStep === 1} done={currentStep > 1} />
            <StepItem number={2} text="Verify your email" active={currentStep === 2} done={currentStep > 2} />
            <StepItem number={3} text="Access dashboard" active={currentStep === 3} done={currentStep > 3} />
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={s.rightCol}>
        <div style={s.formWrap}>
          <div style={{ textAlign: 'center' }}>
            <ShieldMark size={36} />
            <h1 style={{ ...s.heading, marginTop: 16 }}>
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Verify Email'}
            </h1>
            <p style={s.sub}>
              {mode === 'login' ? 'Sign in to your admin account.' : mode === 'signup' ? 'Enter your details to get started.' : `Enter the code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div style={error.includes('sent') || error.includes('created') ? s.success : s.error}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
            {mode === 'signup' && (
              <div style={s.inputWrap}>
                <label style={s.label}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={s.input} />
              </div>
            )}

            {mode === 'otp_verify' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 16 }}>
                <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                <p style={{ fontSize: 14, color: 'rgba(242,238,232,0.3)', textAlign: 'center' }}>
                  Didn&apos;t receive the code?{' '}
                  <button type="button" onClick={handleSignupSendOtp} style={{ color: 'rgba(242,238,232,0.6)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Resend</button>
                </p>
              </div>
            ) : (
              <>
                <div style={s.inputWrap}>
                  <label style={s.label}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@example.com" required style={s.input} />
                </div>
                <div style={s.inputWrap}>
                  <label style={s.label}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8+ characters" required minLength={8} style={s.input} />
                  <p style={{ fontSize: 12, color: 'rgba(242,238,232,0.3)' }}>Requires at least 8 symbols.</p>
                </div>
              </>
            )}

            <button type="submit" disabled={loading || (mode === 'otp_verify' && otpCode.length < 6)}
              style={{ ...s.btn, ...(loading || (mode === 'otp_verify' && otpCode.length < 6) ? s.btnDisabled : {}) }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.opacity = '0.9'; }}
              onMouseLeave={e => { if (!loading) (e.target as HTMLButtonElement).style.opacity = '1'; }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Spinner /> Please wait&hellip;</span> :
                mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Send Verification Code' : 'Verify & Create Account'}
            </button>
          </form>

          <p style={s.link}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { if (mode === 'login') { setMode('signup'); } else { setMode('login'); } setError(''); setOtpCode(''); }}
              style={{ color: '#F2EEE8', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @media (min-width: 1024px) { .login-left-col { display: flex !important; } }
        input:focus { border-color: rgba(242,238,232,0.3) !important; box-shadow: 0 0 0 2px rgba(242,238,232,0.1) !important; }
      `}</style>
    </div>
  );
}
