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
    <div className="space-y-8">
      <div className="section-header">
        <h1>Help & Support</h1>
        <p>Get help with Tirbeo</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {LINKS.map(l => (
          <a key={l.title} href={l.href} target="_blank" rel="noopener noreferrer"
            className="glass group" style={{ padding: "16px 18px", display: "block", textDecoration: "none" }}>
            <div className="flex items-start gap-3">
              <l.icon size={18} style={{ color: "var(--text-secondary)", marginTop: 1, flexShrink: 0 }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>{l.title}</p>
                  <ExternalLink size={11} style={{ color: "var(--text-muted)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{l.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="glass-subtle" style={{ padding: "12px 16px", borderRadius: 10 }}>
        <p style={{ fontSize: 11, textAlign: "center", color: "var(--text-muted)" }}>
          Tirbeo v1.0.0 · <a href="https://tirbeo.app/changelog" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}>Release Notes</a>
        </p>
      </div>
    </div>
  );
}
