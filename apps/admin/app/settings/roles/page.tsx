'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../lib';

interface Role {
  id: string; name: string; description: string | null;
  color: string; icon: string; isSystem: boolean;
  permissions: Record<string, boolean>;
  _count: { assignments: number };
}

const DEFAULT_PERMS: Record<string, boolean> = {};
const PERM_GROUPS = [
  { label: 'Access', keys: [{ key: 'access.dashboard', label: 'Dashboard overview' }] },
  { label: 'System Management', keys: [
    { key: 'system.routes', label: 'View & manage routes' },
    { key: 'system.monitor', label: 'View monitor & logs' },
    { key: 'system.users', label: 'View users' },
    { key: 'system.users.manage', label: 'Edit / update users' },
    { key: 'system.users.delete', label: 'Delete users' },
    { key: 'system.workspaces', label: 'View workspaces' },
    { key: 'system.workspaces.delete', label: 'Delete workspaces' },
  ]},
  { label: 'Landing Settings', keys: [
    { key: 'landing.view', label: 'View landing settings' },
    { key: 'landing.edit', label: 'Edit landing settings' },
  ]},
  { label: 'Accounts Settings', keys: [
    { key: 'accounts.view', label: 'View accounts settings' },
    { key: 'accounts.edit', label: 'Edit accounts settings' },
  ]},
  { label: 'Dashboard Settings', keys: [
    { key: 'settings.dashboard.view', label: 'View dashboard settings' },
    { key: 'settings.dashboard.edit', label: 'Edit dashboard settings' },
  ]},
  { label: 'Admin Settings', keys: [
    { key: 'settings.admin.view', label: 'View admin settings' },
    { key: 'settings.admin.edit', label: 'Edit admin settings' },
  ]},
  { label: 'API Settings', keys: [
    { key: 'settings.api.view', label: 'View API settings' },
    { key: 'settings.api.edit', label: 'Edit API settings' },
  ]},
  { label: 'Role Management', keys: [
    { key: 'roles.view', label: 'View roles' },
    { key: 'roles.create', label: 'Create roles' },
    { key: 'roles.edit', label: 'Edit roles' },
    { key: 'roles.delete', label: 'Delete roles' },
  ]},
  { label: 'Domain Settings', keys: [
    { key: 'domains.view', label: 'View domain settings' },
  ]},
];

const SVG_PATHS: Record<string, React.ReactNode> = {
  shield: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4z" /></>,
  star: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" /></>,
  crown: <><path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20M4 17l2-12 6 4 6-4 2 12H4z" /><circle cx="12" cy="5" r="1.5" fill="currentColor" /></>,
  bolt: <><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></>,
  heart: <><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" /></>,
  eye: <><path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
  key: <><path strokeLinecap="round" strokeLinejoin="round" d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" /></>,
  pencil: <><path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></>,
  wrench: <><path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></>,
  flag: <><path strokeLinecap="round" strokeLinejoin="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
  book: <><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></>,
  bell: <><path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" /></>,
  tag: <><path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  'user-cog': <><circle cx="12" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 21a6.5 6.5 0 0113 0" /></>,
  users: <><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>,
  chat: <><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>,
  code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  alert: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  file: <><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  paperclip: <><path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></>,
};

const ICON_OPTIONS = [
  { value: 'shield', label: 'Shield' },
  { value: 'star', label: 'Star' },
  { value: 'crown', label: 'Crown' },
  { value: 'bolt', label: 'Bolt' },
  { value: 'heart', label: 'Heart' },
  { value: 'eye', label: 'Eye' },
  { value: 'gear', label: 'Gear' },
  { value: 'key', label: 'Key' },
  { value: 'lock', label: 'Lock' },
  { value: 'pencil', label: 'Pencil' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'flag', label: 'Flag' },
  { value: 'book', label: 'Book' },
  { value: 'bell', label: 'Bell' },
  { value: 'tag', label: 'Tag' },
  { value: 'user-cog', label: 'User Cog' },
  { value: 'users', label: 'Users' },
  { value: 'globe', label: 'Globe' },
  { value: 'chat', label: 'Chat' },
  { value: 'code', label: 'Code' },
];

function RoleIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const paths = SVG_PATHS[icon];
  if (!paths) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {SVG_PATHS.shield}
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {paths}
    </svg>
  );
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Role | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#4f7aff', icon: 'shield', permissions: { ...DEFAULT_PERMS } });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/roles');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setRoles(data.roles);
    } catch { setError('Failed to load roles'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const resetForm = () => setForm({ name: '', description: '', color: '#4f7aff', icon: 'shield', permissions: {} });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const res = await apiFetch('/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setMsg({ type: 'success', text: 'Role created' });
      setShowCreate(false); resetForm(); loadRoles();
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setMsg(null);
    try {
      const res = await apiFetch(`/api/admin/roles/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setMsg({ type: 'success', text: 'Role updated' });
      setEditing(null); loadRoles();
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' });
      if (!res.ok) { const t = await res.text(); throw new Error(t); }
      setMsg({ type: 'success', text: 'Role deleted' });
      loadRoles();
    } catch (err: any) { setMsg({ type: 'error', text: err.message }); }
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({ name: role.name, description: role.description || '', color: role.color, icon: role.icon, permissions: { ...role.permissions } });
  };

  const togglePerm = (key: string) => {
    setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));
  };

  const countActivePerms = (perms: Record<string, boolean>) =>
    Object.values(perms).filter(Boolean).length;

  if (loading) return <div className="settings-page"><p className="loading">Loading roles…</p></div>;

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <div>
          <h2>Roles & Permissions</h2>
          <p className="desc">Create and manage custom roles with granular permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreate(true); }}>+ New Role</button>
      </div>
      {msg && <div className={`toast toast-${msg.type}`}>{msg.text}<button className="toast-close" onClick={() => setMsg(null)}>×</button></div>}
      {error && <p className="error">{error}</p>}

      {/* Roles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {roles.map(role => (
          <div key={role.id} className="section-card" style={{ marginBottom: 0 }}>
            <div className="section-card-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: role.color + '18',
                  border: `2px solid ${role.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  <RoleIcon icon={role.icon} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {role.name}
                    {role.isSystem && <span className="badge badge-super_admin" style={{ fontSize: 9 }}>SYSTEM</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{role.description || 'No description'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                <span>{role._count.assignments} user{role._count.assignments !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>{countActivePerms(role.permissions)} permissions</span>
              </div>
              {!role.isSystem && (
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(role)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(role)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {(showCreate || editing) && (
        <div className="modal-overlay" onClick={() => { setShowCreate(false); setEditing(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              <h3>{editing ? 'Edit Role' : 'Create Role'}</h3>
              <p className="modal-desc">{editing ? 'Update role name, color, icon, and permissions' : 'Create a new role with custom permissions'}</p>

              <form onSubmit={editing ? handleUpdate : handleCreate}>
                {/* Basic fields */}
                <div className="field">
                  <div className="field-label">Role Name</div>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Content Editor" />
                </div>
                <div className="field">
                  <div className="field-label">Description</div>
                  <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What can this role do?" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <div className="field-label">Color</div>
                    <div className="color-input-group">
                      <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="color-swatch" />
                      <input className="input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
                    </div>
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <div className="field-label">Icon</div>
                    <select className="select" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
                      {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="sub-section" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Permissions</h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Toggle permissions for this role</p>

                  {PERM_GROUPS.map(group => (
                    <div key={group.label} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                        {group.label}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {group.keys.map(k => (
                          <label key={k.key} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 10px', borderRadius: 6,
                            background: form.permissions[k.key] ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                            border: `1px solid ${form.permissions[k.key] ? 'var(--accent)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer', fontSize: 12, color: form.permissions[k.key] ? 'var(--accent)' : 'var(--text-secondary)',
                            transition: 'all 0.1s',
                          }}>
                            <input type="checkbox" checked={!!form.permissions[k.key]}
                              onChange={() => togglePerm(k.key)}
                              style={{ accentColor: 'var(--accent)' }} />
                            {k.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => { setShowCreate(false); setEditing(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : editing ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
