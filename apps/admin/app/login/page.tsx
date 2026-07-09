'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { API } from '../lib';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = '/';
      } else {
        const text = await res.text();
        setError(text || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  return (
    <div className="login-wrapper">
      <div className="login-bg-shapes">
        <div className="login-shape-1" />
        <div className="login-shape-2" />
      </div>
      <div className="login-split">
        <div className="login-brand-col">
          <div className="login-brand-content">
            <div className="login-brand-header">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D8B36A" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(216,179,106,0.15)"/>
              </svg>
              <span className="login-brand-name">tirbeo</span>
            </div>
            <div className="login-brand-join">
              <div className="login-brand-heading">Admin Panel</div>
              <div className="login-brand-sub">Manage your platform, users, routes, and configurations with full control.</div>
            </div>
            <div className="login-steps">
              <div className="step-item step-active">
                <div className="step-circle step-circle-active">01</div>
                <div><strong>Sign In</strong><span className="step-desc">with admin credentials</span></div>
              </div>
              <div className="step-item step-idle">
                <div className="step-circle step-circle-idle">02</div>
                <div><span>Dashboard</span><span className="step-desc">Overview &amp; analytics</span></div>
              </div>
              <div className="step-item step-idle">
                <div className="step-circle step-circle-idle">03</div>
                <div><span>Manage</span><span className="step-desc">Users, routes &amp; more</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-col">
          <div className="login-panel-wrap">
            <div className="login-panel">
              <div className="login-panel-header">
                <div className="login-panel-logo">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D8B36A" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(216,179,106,0.15)"/>
                    <circle cx="12" cy="11" r="3" stroke="#D8B36A" fill="rgba(216,179,106,0.1)"/>
                  </svg>
                </div>
                <div className="login-panel-title">Welcome back</div>
                <div className="login-panel-sub">Sign in to your admin account</div>
              </div>

              {error && (
                <div className="login-error-banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div className="login-field">
                  <div className={`login-input-wrap${email ? ' has-value' : ''}${error ? ' has-error' : ''}`}>
                    <span className="login-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </span>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="login-input" placeholder="Email" required
                      autoFocus
                    />
                    <label className="login-floating-label">Email</label>
                  </div>
                </div>

                <div className="login-field">
                  <div className={`login-input-wrap${password ? ' has-value' : ''}${error ? ' has-error' : ''}`}>
                    <span className="login-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="login-input" placeholder="Password" required minLength={8}
                    />
                    <label className="login-floating-label">Password</label>
                    <button
                      type="button" className="login-toggle-vis"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-btn-primary" style={{ marginTop: 8 }}>
                  {loading ? (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round"/></svg> Signing in...</>
                  ) : (
                    <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></>
                  )}
                </button>
              </form>

              <div className="login-panel-shadow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
