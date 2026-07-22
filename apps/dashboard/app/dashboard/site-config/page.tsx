"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe, Navigation, Megaphone, MessageSquare, HelpCircle,
  Mail, LayoutGrid, Package, Users, FileText, Eye,
  Save, RotateCcw, ChevronDown, Plus, Trash2, ExternalLink,
} from "lucide-react";

type Section = {
  section: string;
  data: Record<string, any>;
  description?: string;
  updated_at?: string;
};

const SECTIONS = [
  { key: "brand", label: "Brand", icon: Globe },
  { key: "navbar", label: "Navbar", icon: Navigation },
  { key: "hero", label: "Hero", icon: Megaphone },
  { key: "products", label: "Products", icon: Package },
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "about", label: "About", icon: FileText },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "newsletter", label: "Newsletter", icon: Mail },
  { key: "footer", label: "Footer", icon: LayoutGrid },
  { key: "testimonials", label: "Testimonials", icon: Users },
  { key: "preview", label: "Preview", icon: Eye },
];

export default function SiteConfigPage() {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("brand");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-config", { cache: "no-store" });
      if (res.ok) setConfig(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (section: string) => {
    setSaving(true);
    setMsg(null);
    try {
      const { _description, _updated_at, ...data } = config[section] || {};
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      if (res.ok) setMsg({ type: "success", text: `${section} saved` });
      else setMsg({ type: "error", text: `Failed: ${res.statusText}` });
    } catch {
      setMsg({ type: "error", text: "Network error" });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  const update = (section: string, key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const updateBilingual = (section: string, key: string, lang: "en" | "ne", value: string) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: { ...(prev[section]?.[key] || {}), [lang]: value },
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "rgba(255,255,255,0.4)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="section-header flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: 0 }}>
        <div>
          <h1>Site Config</h1>
          <p>Edit landing page content. Changes go live after saving.</p>
        </div>
        <div className="flex items-center gap-2">
          {msg && (
            <span style={{ fontSize: 13, fontWeight: 500, color: msg.type === "success" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)" }}>
              {msg.text}
            </span>
          )}
          <button onClick={load} className="btn btn-ghost" style={{ height: 32, fontSize: 12 }}>
            <RotateCcw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-5" style={{ minHeight: 500 }}>
        {/* Sidebar tabs */}
        <div className="hidden md:flex flex-col gap-0.5" style={{ width: 170, flexShrink: 0 }}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active_ = active === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  color: active_ ? "var(--text)" : "var(--text-secondary)",
                  background: active_ ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{
                  color: active === s.key ? "var(--text)" : "var(--text-muted)",
                  background: active === s.key ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active === s.key ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <Icon size={12} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="glass" style={{ padding: 20 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                {SECTIONS.find((s) => s.key === active)?.label} Settings
              </h2>
              <button
                onClick={() => save(active)}
                disabled={saving}
                className="btn btn-primary"
                style={{ height: 32, fontSize: 12 }}
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {active === "brand" && <BrandEditor data={config.brand} update={update} />}
            {active === "navbar" && <NavbarEditor data={config.navbar} config={config} update={update} />}
            {active === "hero" && <HeroEditor data={config.hero} update={update} updateBilingual={updateBilingual} />}
            {active === "products" && <ProductsEditor data={config.products} config={config} update={update} />}
            {active === "chat" && <ChatEditor data={config.chat} update={update} updateBilingual={updateBilingual} />}
            {active === "about" && <AboutEditor data={config.about} config={config} update={update} updateBilingual={updateBilingual} />}
            {active === "faq" && <FaqEditor data={config.faq} config={config} update={update} updateBilingual={updateBilingual} />}
            {active === "newsletter" && <NewsletterEditor data={config.newsletter} update={update} updateBilingual={updateBilingual} />}
            {active === "footer" && <FooterEditor data={config.footer} config={config} update={update} />}
            {active === "testimonials" && <TestimonialsEditor data={config.testimonials} config={config} update={update} updateBilingual={updateBilingual} />}
            {active === "preview" && <PreviewEditor data={config.preview} config={config} update={update} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Bilingual field ═══ */
function BiField({ label, value, section, field, updateBilingual }: {
  label: string; value: any; section: string; field: string;
  updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void;
}) {
  const v = typeof value === "object" && value !== null ? value : { en: String(value || ""), ne: "" };
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input
        className="input-field"
        value={v.en || ""}
        onChange={(e) => updateBilingual(section, field, "en", e.target.value)}
        placeholder="English"
      />
      <input
        className="input-field"
        value={v.ne || ""}
        onChange={(e) => updateBilingual(section, field, "ne", e.target.value)}
        placeholder="Nepali"
      />
    </div>
  );
}

/* ═══ Simple text field ═══ */
function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input
        className="input-field"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ═══ BRAND ═══ */
function BrandEditor({ data, update }: { data: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No brand data</p>;
  return (
    <div className="space-y-4" style={{ maxWidth: 500 }}>
      <Field label="Brand Name" value={data.name} onChange={(v) => update("brand", "name", v)} placeholder="Tirbeo" />
      <Field label="Logo URL" value={data.logo} onChange={(v) => update("brand", "logo", v)} placeholder="/logo.png" />
      <div className="flex items-center gap-3 mt-2">
        {data.logo && <img src={data.logo} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} />}
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Logo preview</span>
      </div>
      <Field label="Home Link URL" value={data.logoHref} onChange={(v) => update("brand", "logoHref", v)} placeholder="https://tirbeo.app" />
    </div>
  );
}

/* ═══ NAVBAR ═══ */
function NavbarEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No navbar data</p>;
  const links = data.links || [];
  const updateLink = (i: number, field: string, value: any) => {
    const newLinks = [...links];
    newLinks[i] = { ...newLinks[i], [field]: value };
    update("navbar", "links", newLinks);
  };
  const updateLinkLabel = (i: number, lang: "en" | "ne", value: string) => {
    const newLinks = [...links];
    newLinks[i] = { ...newLinks[i], label: { ...(newLinks[i].label || {}), [lang]: value } };
    update("navbar", "links", newLinks);
  };
  const addLink = () => {
    update("navbar", "links", [...links, { key: `nav.new${links.length}`, label: { en: "New Link", ne: "नयाँ लिङ्क" }, href: "#" }]);
  };
  const removeLink = (i: number) => {
    update("navbar", "links", links.filter((_: any, idx: number) => idx !== i));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Navigation Links</h3>
          <button onClick={addLink} className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
            <Plus size={12} /> Add Link
          </button>
        </div>
        <div className="space-y-3">
          {links.map((link: any, i: number) => (
            <div key={i} className="glass-subtle" style={{ padding: 16, borderRadius: 14 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Link #{i + 1}</span>
                <button onClick={() => removeLink(i)} className="btn btn-ghost" style={{ height: 28, padding: "0 8px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Key" value={link.key} onChange={(v) => updateLink(i, "key", v)} placeholder="nav.products" />
                <Field label="URL" value={link.href} onChange={(v) => updateLink(i, "href", v)} placeholder="https://..." />
                <Field label="Label (EN)" value={link.label?.en || ""} onChange={(v) => updateLinkLabel(i, "en", v)} />
                <Field label="Label (NE)" value={link.label?.ne || ""} onChange={(v) => updateLinkLabel(i, "ne", v)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>Auth Buttons</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-subtle" style={{ padding: 16, borderRadius: 14 }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Sign Up</p>
            <Field label="URL" value={data.signup?.href || ""} onChange={(v) => update("navbar", "signup", { ...data.signup, href: v })} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Field label="Text EN" value={data.signup?.label?.en || ""} onChange={(v) => update("navbar", "signup", { ...data.signup, label: { ...data.signup?.label, en: v } })} />
              <Field label="Text NE" value={data.signup?.label?.ne || ""} onChange={(v) => update("navbar", "signup", { ...data.signup, label: { ...data.signup?.label, ne: v } })} />
            </div>
          </div>
          <div className="glass-subtle" style={{ padding: 16, borderRadius: 14 }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Login</p>
            <Field label="URL" value={data.login?.href || ""} onChange={(v) => update("navbar", "login", { ...data.login, href: v })} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Field label="Text EN" value={data.login?.label?.en || ""} onChange={(v) => update("navbar", "login", { ...data.login, label: { ...data.login?.label, en: v } })} />
              <Field label="Text NE" value={data.login?.label?.ne || ""} onChange={(v) => update("navbar", "login", { ...data.login, label: { ...data.login?.label, ne: v } })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ HERO ═══ */
function HeroEditor({ data, update, updateBilingual }: { data: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No hero data</p>;
  return (
    <div className="space-y-4" style={{ maxWidth: 600 }}>
      <BiField label="Tagline" value={data.tagline} section="hero" field="tagline" updateBilingual={updateBilingual} />
      <BiField label="Title" value={data.title} section="hero" field="title" updateBilingual={updateBilingual} />
      <BiField label="CTA Button Text" value={data.cta} section="hero" field="cta" updateBilingual={updateBilingual} />
      <Field label="Placeholder (EN)" value={data.placeholderEn} onChange={(v) => update("hero", "placeholderEn", v)} />
      <Field label="Placeholder (NE)" value={data.placeholderNe} onChange={(v) => update("hero", "placeholderNe", v)} />
      <Field label="Submitted Message (EN)" value={data.submittedEn} onChange={(v) => update("hero", "submittedEn", v)} />
      <Field label="Submitted Message (NE)" value={data.submittedNe} onChange={(v) => update("hero", "submittedNe", v)} />
    </div>
  );
}

/* ═══ PRODUCTS ═══ */
function ProductsEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No products data</p>;
  const items = data.items || [];
  const updateItem = (i: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: value };
    update("products", "items", newItems);
  };
  const updateItemBilingual = (i: number, field: string, lang: "en" | "ne", value: string) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: { ...(newItems[i][field] || {}), [lang]: value } };
    update("products", "items", newItems);
  };
  const addItem = () => {
    update("products", "items", [...items, { n: String(items.length + 1).padStart(2, "0"), name: { en: "New Product", ne: "नयाँ उत्पादन" }, category: { en: "", ne: "" }, cta: { en: "View", ne: "हेर्नुहोस्" }, href: "#", col1Top: "", col1Bottom: "", col2: "" }]);
  };
  const removeItem = (i: number) => {
    update("products", "items", items.filter((_: any, idx: number) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <BiField label="Section Heading" value={data.heading} section="products" field="heading" updateBilingual={(s, f, l, v) => update("products", "heading", { ...(data.heading || {}), [l]: v })} />
      </div>

      {items.map((item: any, i: number) => (
        <div key={i} className="glass-subtle" style={{ padding: 16, borderRadius: 14 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Product #{i + 1} — {item.n}</span>
            <button onClick={() => removeItem(i)} className="btn btn-ghost" style={{ height: 28, padding: "0 8px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              <Trash2 size={12} /> Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Number" value={item.n} onChange={(v) => updateItem(i, "n", v)} placeholder="01" />
            <Field label="CTA URL" value={item.href} onChange={(v) => updateItem(i, "href", v)} />
            <Field label="Name (EN)" value={item.name?.en || ""} onChange={(v) => updateItemBilingual(i, "name", "en", v)} />
            <Field label="Name (NE)" value={item.name?.ne || ""} onChange={(v) => updateItemBilingual(i, "name", "ne", v)} />
            <Field label="CTA (EN)" value={item.cta?.en || ""} onChange={(v) => updateItemBilingual(i, "cta", "en", v)} />
            <Field label="CTA (NE)" value={item.cta?.ne || ""} onChange={(v) => updateItemBilingual(i, "cta", "ne", v)} />
          </div>
          <div className="mt-3 space-y-2">
            <Field label="Image Top-Left" value={item.col1Top} onChange={(v) => updateItem(i, "col1Top", v)} placeholder="https://..." />
            <Field label="Image Bottom-Left" value={item.col1Bottom} onChange={(v) => updateItem(i, "col1Bottom", v)} placeholder="https://..." />
            <Field label="Image Right" value={item.col2} onChange={(v) => updateItem(i, "col2", v)} placeholder="https://..." />
          </div>
        </div>
      ))}

      <button onClick={addItem} className="btn btn-ghost" style={{ height: 36, fontSize: 13 }}>
        <Plus size={14} /> Add Product
      </button>
    </div>
  );
}

/* ═══ CHAT ═══ */
function ChatEditor({ data, update, updateBilingual }: { data: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No chat data</p>;
  return (
    <div className="space-y-4" style={{ maxWidth: 600 }}>
      <BiField label="Heading" value={data.heading} section="chat" field="heading" updateBilingual={updateBilingual} />
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Description</label>
        <textarea
          className="input-field"
          style={{ height: 80, padding: "12px 16px", resize: "vertical" }}
          value={data.sub?.en || ""}
          onChange={(e) => updateBilingual("chat", "sub", "en", e.target.value)}
          placeholder="English description"
        />
        <textarea
          className="input-field"
          style={{ height: 80, padding: "12px 16px", resize: "vertical" }}
          value={data.sub?.ne || ""}
          onChange={(e) => updateBilingual("chat", "sub", "ne", e.target.value)}
          placeholder="Nepali description"
        />
      </div>
      <Field label="Peer Name" value={data.peer} onChange={(v) => update("chat", "peer", v)} placeholder="Tirbeo" />
      <BiField label="Placeholder" value={data.placeholder} section="chat" field="placeholder" updateBilingual={updateBilingual} />
      <BiField label="Encrypted Label" value={data.encrypted} section="chat" field="encrypted" updateBilingual={updateBilingual} />
      <BiField label="Join Button" value={data.joinBtn} section="chat" field="joinBtn" updateBilingual={updateBilingual} />
      <BiField label="Gated Message" value={data.gated} section="chat" field="gated" updateBilingual={updateBilingual} />
    </div>
  );
}

/* ═══ ABOUT ═══ */
function AboutEditor({ data, config, update, updateBilingual }: { data: any; config: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No about data</p>;
  const paragraphs = data.paragraphs || [];
  const updateParagraph = (i: number, lang: "en" | "ne", value: string) => {
    const newP = [...paragraphs];
    newP[i] = { ...(newP[i] || {}), [lang]: value };
    update("about", "paragraphs", newP);
  };

  return (
    <div className="space-y-4" style={{ maxWidth: 700 }}>
      <BiField label="Eyebrow" value={data.eyebrow} section="about" field="eyebrow" updateBilingual={updateBilingual} />
      <BiField label="Heading" value={data.heading} section="about" field="heading" updateBilingual={updateBilingual} />
      <BiField label="Scroll Label" value={data.scroll} section="about" field="scroll" updateBilingual={updateBilingual} />
      <BiField label="Mission" value={data.mission} section="about" field="mission" updateBilingual={updateBilingual} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Paragraphs</label>
          <button
            onClick={() => update("about", "paragraphs", [...paragraphs, { en: "", ne: "" }])}
            className="btn btn-ghost"
            style={{ height: 28, padding: "0 10px", fontSize: 11 }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-3">
          {paragraphs.map((p: any, i: number) => (
            <div key={i} className="glass-subtle" style={{ padding: 12, borderRadius: 12 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>
                <button
                  onClick={() => update("about", "paragraphs", paragraphs.filter((_: any, idx: number) => idx !== i))}
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <textarea
                className="input-field mb-2"
                style={{ height: 56, padding: "10px 14px", resize: "vertical", fontSize: 13 }}
                value={p.en || ""}
                onChange={(e) => updateParagraph(i, "en", e.target.value)}
                placeholder="English"
              />
              <textarea
                className="input-field"
                style={{ height: 56, padding: "10px 14px", resize: "vertical", fontSize: 13 }}
                value={p.ne || ""}
                onChange={(e) => updateParagraph(i, "ne", e.target.value)}
                placeholder="Nepali"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ FAQ ═══ */
function FaqEditor({ data, config, update, updateBilingual }: { data: any; config: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No FAQ data</p>;
  const items = data.items || [];
  const updateItem = (i: number, field: string, lang: "en" | "ne", value: string) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [field]: { ...(newItems[i][field] || {}), [lang]: value } };
    update("faq", "items", newItems);
  };

  return (
    <div className="space-y-4" style={{ maxWidth: 700 }}>
      <BiField label="Eyebrow" value={data.eyebrow} section="faq" field="eyebrow" updateBilingual={updateBilingual} />
      <BiField label="Heading" value={data.heading} section="faq" field="heading" updateBilingual={updateBilingual} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Questions</label>
          <button
            onClick={() => update("faq", "items", [...items, { q: { en: "", ne: "" }, a: { en: "", ne: "" } }])}
            className="btn btn-ghost"
            style={{ height: 28, padding: "0 10px", fontSize: 11 }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="glass-subtle" style={{ padding: 16, borderRadius: 14 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Q#{i + 1}</span>
                <button
                  onClick={() => update("faq", "items", items.filter((_: any, idx: number) => idx !== i))}
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="space-y-2">
                <input className="input-field" value={item.q?.en || ""} onChange={(e) => updateItem(i, "q", "en", e.target.value)} placeholder="Question (EN)" />
                <input className="input-field" value={item.q?.ne || ""} onChange={(e) => updateItem(i, "q", "ne", e.target.value)} placeholder="Question (NE)" />
                <textarea className="input-field" style={{ height: 60, padding: "10px 14px", resize: "vertical", fontSize: 13 }} value={item.a?.en || ""} onChange={(e) => updateItem(i, "a", "en", e.target.value)} placeholder="Answer (EN)" />
                <textarea className="input-field" style={{ height: 60, padding: "10px 14px", resize: "vertical", fontSize: 13 }} value={item.a?.ne || ""} onChange={(e) => updateItem(i, "a", "ne", e.target.value)} placeholder="Answer (NE)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ NEWSLETTER ═══ */
function NewsletterEditor({ data, update, updateBilingual }: { data: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No newsletter data</p>;
  return (
    <div className="space-y-4" style={{ maxWidth: 500 }}>
      <BiField label="Heading" value={data.heading} section="newsletter" field="heading" updateBilingual={updateBilingual} />
      <BiField label="Subtext" value={data.sub} section="newsletter" field="sub" updateBilingual={updateBilingual} />
      <BiField label="Email Placeholder" value={data.emailPlaceholder} section="newsletter" field="emailPlaceholder" updateBilingual={updateBilingual} />
      <BiField label="Subscribe Button" value={data.subscribe} section="newsletter" field="subscribe" updateBilingual={updateBilingual} />
      <BiField label="Subscribed Message" value={data.subscribed} section="newsletter" field="subscribed" updateBilingual={updateBilingual} />
      <BiField label="Spam Disclaimer" value={data.spam} section="newsletter" field="spam" updateBilingual={updateBilingual} />
    </div>
  );
}

/* ═══ FOOTER ═══ */
function FooterEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No footer data</p>;

  const updateColLink = (ci: number, li: number, field: string, value: any) => {
    const cols = [...(data.columns || [])];
    const links = [...(cols[ci]?.links || [])];
    links[li] = { ...links[li], [field]: value };
    cols[ci] = { ...cols[ci], links };
    update("footer", "columns", cols);
  };

  return (
    <div className="space-y-6" style={{ maxWidth: 700 }}>
      <BiField label="Tagline" value={data.tagline} section="footer" field="tagline" updateBilingual={(s, f, l, v) => update("footer", "tagline", { ...(data.tagline || {}), [l]: v })} />
      <BiField label="Copyright" value={data.rights} section="footer" field="rights" updateBilingual={(s, f, l, v) => update("footer", "rights", { ...(data.rights || {}), [l]: v })} />

      {(data.columns || []).map((col: any, ci: number) => (
        <div key={ci} className="glass-subtle" style={{ padding: 16, borderRadius: 14 }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Column: {col.title?.en}</p>
          {(col.links || []).map((link: any, li: number) => (
            <div key={li} className="grid grid-cols-3 gap-2 mb-2" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
              <input className="input-field" style={{ height: 36, fontSize: 12 }} value={link.label?.en || ""} onChange={(e) => updateColLink(ci, li, "label", { ...link.label, en: e.target.value })} placeholder="EN" />
              <input className="input-field" style={{ height: 36, fontSize: 12 }} value={link.label?.ne || ""} onChange={(e) => updateColLink(ci, li, "label", { ...link.label, ne: e.target.value })} placeholder="NE" />
              <input className="input-field" style={{ height: 36, fontSize: 12 }} value={link.href || ""} onChange={(e) => updateColLink(ci, li, "href", e.target.value)} placeholder="URL" />
            </div>
          ))}
        </div>
      ))}

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>Social Links</label>
        {(data.connect || []).map((c: any, i: number) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
            <input className="input-field" style={{ height: 36, fontSize: 12 }} value={c.label || ""} onChange={(e) => {
              const arr = [...data.connect]; arr[i] = { ...arr[i], label: e.target.value }; update("footer", "connect", arr);
            }} placeholder="Label" />
            <input className="input-field" style={{ height: 36, fontSize: 12 }} value={c.icon || ""} onChange={(e) => {
              const arr = [...data.connect]; arr[i] = { ...arr[i], icon: e.target.value }; update("footer", "connect", arr);
            }} placeholder="Icon" />
            <input className="input-field" style={{ height: 36, fontSize: 12 }} value={c.href || ""} onChange={(e) => {
              const arr = [...data.connect]; arr[i] = { ...arr[i], href: e.target.value }; update("footer", "connect", arr);
            }} placeholder="URL" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ TESTIMONIALS ═══ */
function TestimonialsEditor({ data, config, update, updateBilingual }: { data: any; config: any; update: (s: string, k: string, v: any) => void; updateBilingual: (s: string, f: string, l: "en" | "ne", v: string) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No testimonials data</p>;
  const items = data.items || [];

  return (
    <div className="space-y-4" style={{ maxWidth: 700 }}>
      <BiField label="Heading" value={data.heading} section="testimonials" field="heading" updateBilingual={updateBilingual} />
      <BiField label="Subtext" value={data.sub} section="testimonials" field="sub" updateBilingual={updateBilingual} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Testimonials ({items.length})</label>
          <button
            onClick={() => update("testimonials", "items", [...items, { quote: { en: "", ne: "" }, name: "", role: "", avatar: "https://randomuser.me/api/portraits/lego/1.jpg" }])}
            className="btn btn-ghost"
            style={{ height: 28, padding: "0 10px", fontSize: 11 }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="glass-subtle" style={{ padding: 16, borderRadius: 14 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {item.avatar && <img src={item.avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />}
                  <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{item.name || `#${i + 1}`}</span>
                </div>
                <button
                  onClick={() => update("testimonials", "items", items.filter((_: any, idx: number) => idx !== i))}
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="space-y-2">
                <textarea className="input-field" style={{ height: 56, padding: "10px 14px", resize: "vertical", fontSize: 13 }} value={item.quote?.en || ""} onChange={(e) => {
                  const arr = [...items]; arr[i] = { ...arr[i], quote: { ...arr[i].quote, en: e.target.value } }; update("testimonials", "items", arr);
                }} placeholder="Quote (EN)" />
                <textarea className="input-field" style={{ height: 56, padding: "10px 14px", resize: "vertical", fontSize: 13 }} value={item.quote?.ne || ""} onChange={(e) => {
                  const arr = [...items]; arr[i] = { ...arr[i], quote: { ...arr[i].quote, ne: e.target.value } }; update("testimonials", "items", arr);
                }} placeholder="Quote (NE)" />
                <div className="grid grid-cols-2 gap-2">
                  <input className="input-field" style={{ height: 36, fontSize: 13 }} value={item.name || ""} onChange={(e) => {
                    const arr = [...items]; arr[i] = { ...arr[i], name: e.target.value }; update("testimonials", "items", arr);
                  }} placeholder="Name" />
                  <input className="input-field" style={{ height: 36, fontSize: 13 }} value={item.role || ""} onChange={(e) => {
                    const arr = [...items]; arr[i] = { ...arr[i], role: e.target.value }; update("testimonials", "items", arr);
                  }} placeholder="Role" />
                </div>
                <input className="input-field" style={{ height: 36, fontSize: 13 }} value={item.avatar || ""} onChange={(e) => {
                  const arr = [...items]; arr[i] = { ...arr[i], avatar: e.target.value }; update("testimonials", "items", arr);
                }} placeholder="Avatar URL" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ PREVIEW ═══ */
function PreviewEditor({ data, config, update }: { data: any; config: any; update: (s: string, k: string, v: any) => void }) {
  if (!data) return <p style={{ color: "var(--text-muted)" }}>No preview data</p>;
  return (
    <div className="space-y-4" style={{ maxWidth: 600 }}>
      <Field label="Heading (EN)" value={data.heading?.en || ""} onChange={(v) => update("preview", "heading", { ...data.heading, en: v })} />
      <Field label="Heading (NE)" value={data.heading?.ne || ""} onChange={(v) => update("preview", "heading", { ...data.heading, ne: v })} />
      <Field label="Subtext (EN)" value={data.sub?.en || ""} onChange={(v) => update("preview", "sub", { ...data.sub, en: v })} />
      <Field label="Subtext (NE)" value={data.sub?.ne || ""} onChange={(v) => update("preview", "sub", { ...data.sub, ne: v })} />
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Sidebar, communities, and feed posts are editable via direct Supabase dashboard or API.
      </p>
    </div>
  );
}
