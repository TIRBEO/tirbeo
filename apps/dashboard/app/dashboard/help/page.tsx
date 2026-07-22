"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  HelpCircle, BookOpen, MessageSquare, Shield, Bug, ExternalLink,
  ChevronDown, ChevronRight, Search, Mail, FileText, Zap, Globe,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.tirbeo.app";

type HelpArticle = { id: string; title: string; content: string; category: string; icon: string };
type HelpConfig = { articles: HelpArticle[]; contactEmail: string; faqEnabled: boolean };

const DEFAULT_ARTICLES: HelpArticle[] = [
  { id: "1", title: "Getting Started with Tirbeo", content: "Welcome to Tirbeo! This guide will help you set up your account, configure your profile, and explore the platform. Start by completing your profile in the Profile section, then enable two-factor authentication in Security for added protection.", category: "Getting Started", icon: "zap" },
  { id: "2", title: "How to Change Your Password", content: "Go to Security → Change Password. Enter your current password, then your new password (minimum 8 characters). We recommend using a mix of letters, numbers, and symbols. You'll be signed out of other devices after changing your password.", category: "Security", icon: "shield" },
  { id: "3", title: "Setting Up Two-Factor Authentication", content: "Navigate to Security → Two-Factor Authentication. You can use an authenticator app (Google Authenticator, Authy, etc.) or SMS verification. We strongly recommend enabling 2FA to protect your account from unauthorized access.", category: "Security", icon: "shield" },
  { id: "4", title: "Managing Your Notifications", content: "Go to Preferences → Notifications to configure what alerts you receive. You can choose between instant, daily, or weekly email digests. Security alerts are always sent immediately for your protection.", category: "Account", icon: "bell" },
  { id: "5", title: "Customizing Your Dashboard", content: "Open Preferences to personalize your experience. Change themes (light/dark/system), adjust fonts, modify colors, configure sidebar layout, and set your timezone and language. All changes are saved automatically.", category: "Account", icon: "settings" },
  { id: "6", title: "Connecting Third-Party Accounts", content: "Visit Integrations to connect Google, GitHub, and other services. Connected accounts let you sign in without a password. You can disconnect any provider at any time from the same page.", category: "Account", icon: "link" },
  { id: "7", title: "Understanding Your Activity Log", content: "The Activity page shows a complete history of everything that happened on your account — sign-ins, password changes, settings updates, and more. Use the filters to find specific events. Security events are highlighted for easy identification.", category: "Account", icon: "activity" },
  { id: "8", title: "Managing Active Sessions", content: "In Security → Active Sessions, you can see all devices currently signed into your account. Revoke any session you don't recognize. We recommend reviewing sessions regularly and revoking old ones.", category: "Security", icon: "shield" },
  { id: "9", title: "Recovery Options", content: "Set up recovery email and phone in Security → Recovery Options. These help you regain access if you lose your 2FA device. Keep your recovery email verified and your phone number up to date.", category: "Security", icon: "shield" },
  { id: "10", title: "Backup Codes", content: "In Security → Backup Codes, you can generate one-time codes for emergency access. Each code can only be used once. Store them securely — they're your backup if you lose access to your authenticator app.", category: "Security", icon: "shield" },
  { id: "11", title: "Reporting a Bug", content: "Found a bug? Report it through our GitHub issues page or contact support directly. Include your browser, device, and steps to reproduce the issue. Our team will investigate and respond as quickly as possible.", category: "Support", icon: "bug" },
  { id: "12", title: "Privacy & Data", content: "Your privacy matters. You can export all your data from Preferences → Data & Privacy. To delete your account, go to the same section and follow the account deletion process. This action is irreversible.", category: "Account", icon: "globe" },
];

const ICON_MAP: Record<string, typeof HelpCircle> = {
  zap: Zap, shield: Shield, bell: Bell, settings: Globe, link: ExternalLink,
  activity: HelpCircle, bug: Bug, globe: Globe,
};

export default function HelpPage() {
  const [config, setConfig] = useState<HelpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch(`${API}/api/public/help-config`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setConfig(d || { articles: DEFAULT_ARTICLES, contactEmail: "support@tirbeo.app", faqEnabled: true }))
      .catch(() => setConfig({ articles: DEFAULT_ARTICLES, contactEmail: "support@tirbeo.app", faqEnabled: true }))
      .finally(() => setLoading(false));
  }, []);

  const articles = config?.articles || DEFAULT_ARTICLES;
  const categories = ["All", ...new Set(articles.map(a => a.category))];

  const filteredArticles = articles.filter(a => {
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton" style={{ height: 40, width: 200 }} />
        <div className="skeleton" style={{ height: 200 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h1>Help & Support</h1>
        <p>Find answers to common questions and get help with your account</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-ash)" }} />
        <input
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search help articles..."
          className="input-field" style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Categories */}
      <div className="filter-tabs">
        {categories.map(c => (
          <button key={c} className={`filter-tab ${activeCategory === c ? "active" : ""}`} onClick={() => setActiveCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Contact Support", desc: "Get in touch with our team", icon: Mail, href: "mailto:support@tirbeo.app" },
          { label: "Report a Bug", desc: "Found something wrong?", icon: Bug, href: "https://github.com/TIRBEO/tirbeo/issues" },
          { label: "Feature Request", desc: "Suggest an improvement", icon: MessageSquare, href: "https://github.com/TIRBEO/tirbeo/issues" },
        ].map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
            className="glass-subtle group" style={{ padding: "16px 18px", display: "block", textDecoration: "none", borderRadius: 12 }}>
            <div className="flex items-center justify-between mb-2">
              <link.icon size={18} style={{ color: "var(--text-secondary)" }} />
              <ExternalLink size={12} style={{ color: "var(--text-ash)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{link.label}</p>
            <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 3 }}>{link.desc}</p>
          </a>
        ))}
      </div>

      {/* Articles */}
      <div className="glass" style={{ overflow: "hidden" }}>
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <HelpCircle size={28} style={{ color: "var(--text-ash)", marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No articles found</p>
            <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 4 }}>Try a different search term</p>
          </div>
        ) : (
          filteredArticles.map(article => {
            const Icon = ICON_MAP[article.icon] || HelpCircle;
            const expanded = expandedId === article.id;
            return (
              <div key={article.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <button
                  onClick={() => setExpandedId(expanded ? null : article.id)}
                  className="flex items-center gap-3 w-full text-left"
                  style={{ padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={14} style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{article.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-ash)", marginTop: 2 }}>{article.category}</p>
                  </div>
                  {expanded ? <ChevronDown size={14} style={{ color: "var(--text-ash)" }} /> : <ChevronRight size={14} style={{ color: "var(--text-ash)" }} />}
                </button>
                {expanded && (
                  <div style={{ padding: "0 20px 16px 68px" }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{article.content}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contact */}
      <div className="glass-subtle" style={{ padding: "20px 24px", borderRadius: 12, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Can't find what you're looking for?{" "}
          <a href={`mailto:${config?.contactEmail || "support@tirbeo.app"}`} style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}>
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
