"use client";

import { BookOpen, HelpCircle, MessageCircle, Bug, ExternalLink } from "lucide-react";

const LINKS = [
  { title: "Documentation", desc: "Guides, API references, and tutorials", icon: BookOpen, href: "https://docs.tirbeo.app" },
  { title: "FAQs", desc: "Common questions and answers", icon: HelpCircle, href: "https://support.tirbeo.app#faq" },
  { title: "Live Chat", desc: "Talk to our support team in real-time", icon: MessageCircle, href: "https://support.tirbeo.app#chat" },
  { title: "Contact Support", desc: "Submit a ticket for personalized help", icon: MessageCircle, href: "https://support.tirbeo.app/contact" },
  { title: "Submit a Bug", desc: "Report an issue or unexpected behavior", icon: Bug, href: "https://support.tirbeo.app#bugs" },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Help & Support</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Get help with Tirbeo</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map(l => (
          <a key={l.title} href={l.href} target="_blank" rel="noopener noreferrer"
            className="glass group" style={{ padding: "20px 22px", display: "block", textDecoration: "none" }}>
            <div className="flex items-start gap-3">
              <l.icon size={20} style={{ color: "var(--text-secondary)", marginTop: 2, flexShrink: 0 }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{l.title}</p>
                  <ExternalLink size={12} style={{ color: "var(--text-muted)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{l.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="glass card-section">
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Tirbeo v1.0.0 · <a href="https://tirbeo.app/changelog" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Release Notes</a></p>
      </div>
    </div>
  );
}
