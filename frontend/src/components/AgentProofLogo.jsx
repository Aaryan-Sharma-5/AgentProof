"use client";

import React, { useId } from "react";

/**
 * AgentProof Official Production Brand Logo
 * Features:
 * - Cryptographic Hexagonal Shield (Verification / Monad consensus)
 * - Autonomous Swarm Nodes (Buyer, Verifier, Payment, Escrow)
 * - Dynamic Gradient Glow & Sacred Quantum Geometry
 * - Multiple layout variants: 'full', 'compact', 'icon'
 */
export default function AgentProofLogo({
  variant = "full",
  size = "md",
  className = "",
  animated = true,
  theme = "dark",
}) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const shieldGradId = `apShieldGrad_${uid}`;
  const cyanGradId = `apCyanGrad_${uid}`;
  const glassFillId = `apGlassFill_${uid}`;
  const glowFilterId = `apGlow_${uid}`;

  const sizeMap = {
    sm: { icon: 32, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 44, text: "text-2xl", sub: "text-[10px]" },
    lg: { icon: 64, text: "text-4xl", sub: "text-xs" },
    xl: { icon: 96, text: "text-5xl", sub: "text-sm" },
  };

  const { icon: iconDim, text: textClass, sub: subClass } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center gap-3 select-none group ${className}`}
      role="banner"
      aria-label="AgentProof Logo"
    >
      {/* 3D-Look Cryptographic Holographic Icon */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: iconDim, height: iconDim }}
      >
        {/* Ambient Back Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-60 transition-all duration-700 group-hover:opacity-90 ${
            animated ? "animate-pulse" : ""
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(255,90,95,0.4) 0%, rgba(131,110,249,0.3) 50%, transparent 70%)",
          }}
        />

        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full relative z-10 transition-transform duration-500 group-hover:scale-105 ${
            animated ? "hover:rotate-6" : ""
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Coral to Monad Purple Gradient */}
            <linearGradient id={shieldGradId} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5A5F" />
              <stop offset="50%" stopColor="#C04CFD" />
              <stop offset="100%" stopColor="#836EF9" />
            </linearGradient>

            {/* Cyan Energy Glow Gradient */}
            <linearGradient id={cyanGradId} x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#4FACFE" />
            </linearGradient>

            {/* Dark Shield Glass Fill */}
            <linearGradient id={glassFillId} x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E1638" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0B0917" stopOpacity="0.95" />
            </linearGradient>

            {/* Drop Shadow Filter */}
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Monad Hexagonal Proof Boundary */}
          <polygon
            points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5"
            fill={`url(#${glassFillId})`}
            stroke={`url(#${shieldGradId})`}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Dimensional Verification Orbit Ring */}
          <circle
            cx="50"
            cy="50"
            r="32"
            stroke={`url(#${cyanGradId})`}
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
            className={animated ? "animate-spin-slow origin-center" : ""}
          />

          {/* Neural Multi-Agent Constellation Links (Mesh) */}
          <path
            d="M50,22 L74,64 M50,22 L26,64 M26,64 L74,64 M50,22 L50,50 M26,64 L50,50 M74,64 L50,50"
            stroke="#836EF9"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* Dynamic Core Verification Diamond */}
          <polygon
            points="50,38 62,50 50,62 38,50"
            fill={`url(#${shieldGradId})`}
            opacity="0.85"
            filter={`url(#${glowFilterId})`}
          />

          {/* Inner Light Nucleus */}
          <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />

          {/* Autonomous Swarm Nodes (4 Agent Identities) */}
          {/* Node 1: Buyer Agent (Top Apex) */}
          <circle cx="50" cy="22" r="4.5" fill="#FF5A5F" filter={`url(#${glowFilterId})`} />
          <circle cx="50" cy="22" r="2" fill="#FFFFFF" />

          {/* Node 2: Verifier Agent (Bottom Right) */}
          <circle cx="74" cy="64" r="4.5" fill="#00F2FE" filter={`url(#${glowFilterId})`} />
          <circle cx="74" cy="64" r="2" fill="#FFFFFF" />

          {/* Node 3: Payment Orchestrator (Bottom Left) */}
          <circle cx="26" cy="64" r="4.5" fill="#836EF9" filter={`url(#${glowFilterId})`} />
          <circle cx="26" cy="64" r="2" fill="#FFFFFF" />

          {/* Verification Check Badge Accent */}
          <path
            d="M45,50 L48.5,53.5 L55,47"
            stroke="#0B0917"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography Lockup */}
      {variant !== "icon" && (
        <div className="flex flex-col">
          <div
            className={`font-display font-extrabold tracking-tight leading-none ${textClass} ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            <span>Agent</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF5A5F] via-[#C04CFD] to-[#836EF9]">
              Proof
            </span>
          </div>

          {variant === "full" && (
            <div
              className={`font-mono font-semibold tracking-widest uppercase mt-0.5 opacity-80 ${subClass} ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Autonomous Verification • Monad
            </div>
          )}
        </div>
      )}
    </div>
  );
}
