"use client";

import { useState, useEffect } from "react";
import { Preloader, CustomCursor } from "@/components/Preloader";

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      <Preloader onSkip={() => setShowContent(true)} />
      <CustomCursor />
      {showContent && (
        <main className="min-h-screen flex flex-col bg-white">
          <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                  <a href="/" className="text-2xl font-bold text-gray-900">
                    Tirbeo
                  </a>
                  <nav className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                      Features
                    </a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                      About
                    </a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                      Blog
                    </a>
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <a href="/login" className="text-gray-700 hover:text-gray-900 transition-colors">
                    Sign in
                  </a>
                  <a href="/signup" className="rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800 transition-colors">
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </header>

          <section className="flex-1 flex items-center justify-center px-4 py-20">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="mb-8 text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
                Social Media
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Built for Nepal
                </span>
              </h1>
              <p className="mb-12 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                A production-grade social media ecosystem with real-time chat, 
                district-based communities, and a modern light interface.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/signup" className="rounded-lg bg-gray-900 px-8 py-4 text-white font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto">
                  Join Tirbeo
                </a>
                <a href="#features" className="rounded-lg border border-gray-300 px-8 py-4 text-gray-900 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  Learn More
                </a>
              </div>
            </div>
          </section>

          <section id="features" className="py-20 px-4 bg-gray-50">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-16 text-4xl font-bold text-center text-gray-900">
                Features
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Real-time Chat",
                    desc: "Lightning-fast messaging with Supabase Realtime. Channels, DMs, and reactions.",
                    icon: "💬"
                  },
                  {
                    title: "District Communities",
                    desc: "77 districts of Nepal, each with their own space. Local discussions, events, and news.",
                    icon: "🗺️"
                  },
                  {
                    title: "Light Mode First",
                    desc: "Clean light interface with smooth animations and custom cursor.",
                    icon: "☀️"
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white shadow-sm border border-gray-200 p-8 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="mb-4 text-4xl">{feature.icon}</div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="border-t border-gray-200 py-12 px-4">
            <div className="mx-auto max-w-7xl text-center text-gray-500">
              <p>© 2025 Tirbeo. Built with Next.js 15, Supabase, and Tailwind CSS v4.</p>
            </div>
          </footer>
        </main>
      )}
    </>
  );
}