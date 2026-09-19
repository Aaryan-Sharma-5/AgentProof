"use client";

import React, { useState } from "react";
import Link from "next/link";
import AgentProofLogo from "../../components/AgentProofLogo";

export default function LogoShowcasePage() {
  const [copied, setCopied] = useState(false);

  const rawSvgCode = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="apShieldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF5A5F"/>
      <stop offset="50%" stop-color="#C04CFD"/>
      <stop offset="100%" stop-color="#836EF9"/>
    </linearGradient>
    <linearGradient id="apGlassFill" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E1638" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0B0917" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" fill="url(#apGlassFill)" stroke="url(#apShieldGrad)" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="32" stroke="#00F2FE" stroke-width="1.2" stroke-dasharray="4 4" stroke-opacity="0.6"/>
  <path d="M50,22 L74,64 M50,22 L26,64 M26,64 L74,64 M50,22 L50,50 M26,64 L50,50 M74,64 L50,50" stroke="#836EF9" stroke-width="1" stroke-opacity="0.5"/>
  <polygon points="50,38 62,50 50,62 38,50" fill="url(#apShieldGrad)" opacity="0.85"/>
  <circle cx="50" cy="50" r="4.5" fill="#FFFFFF"/>
  <circle cx="50" cy="22" r="4.5" fill="#FF5A5F"/>
  <circle cx="74" cy="64" r="4.5" fill="#00F2FE"/>
  <circle cx="26" cy="64" r="4.5" fill="#836EF9"/>
  <path d="M45,50 L48.5,53.5 L55,47" stroke="#0B0917" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawSvgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070614] text-white p-6 sm:p-12 font-sans">
      {/* Header Navigation */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-white/10">
        <AgentProofLogo variant="compact" size="md" theme="dark" />
        <div className="flex items-center gap-4">
          <Link
            href="/preloader"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-[#FF5A5F] to-[#836EF9] hover:opacity-90 transition-all text-white shadow-lg shadow-purple-900/40"
          >
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
            LAUNCH 3D PRELOADER
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/15 transition-all text-gray-200 border border-white/10"
          >
            DASHBOARD
          </Link>
        </div>
      </header>

      {/* Main Brand Section */}
      <main className="max-w-6xl mx-auto py-12 flex flex-col gap-16">
        {/* Title Deck */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FF5A5F] bg-[#FF5A5F]/10 px-3 py-1 rounded-full w-max border border-[#FF5A5F]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A5F] animate-ping" />
            OFFICIAL BRAND IDENTITY
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight">
            AgentProof Brand System
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
            A precision-engineered visual mark reflecting autonomous multi-agent swarm intelligence,
            cryptographic proof verification, and Monad settlement consensus.
          </p>
        </div>

        {/* Hero Showcase Card */}
        <div className="relative rounded-3xl p-8 sm:p-16 border border-white/10 bg-gradient-to-b from-[#131126] to-[#0A0915] shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FF5A5F]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#836EF9]/20 blur-3xl pointer-events-none" />

          {/* Primary Logo Showcase */}
          <div className="flex flex-col gap-6 z-10">
            <span className="text-xs font-mono tracking-wider text-gray-400 uppercase">
              Primary Hero Lockup (Dark Enclave)
            </span>
            <AgentProofLogo variant="full" size="xl" theme="dark" />
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "SVG COPIED TO CLIPBOARD" : "COPY SVG CODE"}
              </button>
            </div>
          </div>

          {/* Large Mark Inspection Box */}
          <div className="z-10 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
            <AgentProofLogo variant="icon" size="xl" />
            <span className="text-[11px] font-mono text-gray-400">MARK: 96x96 VECTOR MESH</span>
          </div>
        </div>

        {/* Variation Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Compact Navbar Mark */}
          <div className="rounded-2xl p-6 border border-white/10 bg-white/[0.03] flex flex-col gap-4">
            <span className="text-xs font-mono text-gray-400 uppercase">01 / Navbar Lockup</span>
            <div className="py-6 flex items-center justify-center bg-black/40 rounded-xl border border-white/5">
              <AgentProofLogo variant="compact" size="md" theme="dark" />
            </div>
            <p className="text-xs text-gray-400 font-sans">
              Optimized for responsive application headers, navigation bars, and mobile viewports.
            </p>
          </div>

          {/* Card 2: Light Theme Lockup */}
          <div className="rounded-2xl p-6 border border-white/10 bg-white/[0.03] flex flex-col gap-4">
            <span className="text-xs font-mono text-gray-400 uppercase">02 / Light Surface</span>
            <div className="py-6 flex items-center justify-center bg-[#FBF9F9] rounded-xl border border-gray-200">
              <AgentProofLogo variant="compact" size="md" theme="light" />
            </div>
            <p className="text-xs text-gray-400 font-sans">
              High-contrast version designed for whitepaper documentation, light mode, and print media.
            </p>
          </div>

          {/* Card 3: App Icon / Avatar */}
          <div className="rounded-2xl p-6 border border-white/10 bg-white/[0.03] flex flex-col gap-4">
            <span className="text-xs font-mono text-gray-400 uppercase">03 / App Icon & Badge</span>
            <div className="py-6 flex items-center justify-center gap-4 bg-black/40 rounded-xl border border-white/5">
              <AgentProofLogo variant="icon" size="lg" />
              <AgentProofLogo variant="icon" size="sm" />
            </div>
            <p className="text-xs text-gray-400 font-sans">
              Standalone glyph for smart contract tokens, browser favicons, and social avatar markers.
            </p>
          </div>
        </div>

        {/* Anatomical Symbolism Breakdown */}
        <div className="rounded-3xl p-8 border border-white/10 bg-white/[0.02] flex flex-col gap-8">
          <h2 className="text-xl font-display font-bold">Logo Anatomical Symbolism</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#836EF9]/20 text-[#836EF9] flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-sm font-semibold text-white">Hexagonal Proof Shield</h3>
              <p className="text-xs text-gray-400">
                Represents Monad consensus security, cryptographic boundary protection, and deterministic policy enforcement.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF5A5F]/20 text-[#FF5A5F] flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-sm font-semibold text-white">Autonomous Agent Swarm</h3>
              <p className="text-xs text-gray-400">
                The 3 apex nodes represent Buyer, Verifier, and Payment Orchestrator agents operating in decentralized harmony.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00F2FE]/20 text-[#00F2FE] flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-sm font-semibold text-white">Neural Verification Mesh</h3>
              <p className="text-xs text-gray-400">
                Internal triangulation constellation connecting the agents to the 7-layer verification pipeline.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
                04
              </div>
              <h3 className="text-sm font-semibold text-white">Central Quantum Core</h3>
              <p className="text-xs text-gray-400">
                The central diamond with inner white nucleus represents the verified ground truth delivered to the user.
              </p>
            </div>
          </div>
        </div>

        {/* Color Palette Tokens */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400">
            Brand Color Specification
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#FF5A5F] text-white font-bold flex flex-col justify-between h-24">
              <span>ELECTRIC CORAL</span>
              <span>#FF5A5F</span>
            </div>
            <div className="p-4 rounded-xl bg-[#836EF9] text-white font-bold flex flex-col justify-between h-24">
              <span>MONAD VIOLET</span>
              <span>#836EF9</span>
            </div>
            <div className="p-4 rounded-xl bg-[#00F2FE] text-black font-bold flex flex-col justify-between h-24">
              <span>CYAN VERIFIER</span>
              <span>#00F2FE</span>
            </div>
            <div className="p-4 rounded-xl bg-[#070614] border border-white/20 text-white font-bold flex flex-col justify-between h-24">
              <span>QUANTUM VOID</span>
              <span>#070614</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
