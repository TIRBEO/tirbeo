'use client';
import React, { useState, useCallback } from 'react';
import { API } from '../lib';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err?.message || 'Connection error. Check your API connection.');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', width: '100%',
      background: '#0d1117', color: '#e6edf3',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '48px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2f81f7" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(47,129,247,0.1)"/>
            </svg>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>Admin Login</h1>
            <p style={{ fontSize: 14, color: 'rgba(230,237,243,0.5)', marginTop: 6 }}>Sign in to manage your platform.</p>
          </div>

          {error && (
            <div style={{
              fontSize: 13, color: '#f85149', background: 'rgba(248,81,73,0.1)',
              border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#e6edf3', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@tirbeo.app"
                required
                style={{
                  width: '100%', height: 40, padding: '0 12px',
                  background: '#151b23', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2f81f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#e6edf3', display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required minLength={8}
                style={{
                  width: '100%', height: 40, padding: '0 12px',
                  background: '#151b23', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: '#e6edf3', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2f81f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', height: 40, marginTop: 8,
                background: loading ? '#238636' : '#238636', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              }}
            >{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
