"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import AgentProofLogo from "./AgentProofLogo";

/**
 * ThreePreloader — Production-Grade 3D Parallel World Architecture
 * Features:
 * - 3D Quantum Proof Core (Nested wireframe icosahedrons + crystalline inner core)
 * - 3 Tilted Multi-Agent Planetary Orbital Rings with revolving luminescent agent nodes
 * - Infinite Parallel Dimension Warp Particle Field (3,500+ dynamic stars with depth travel)
 * - Holographic Infinity Ground Grid with subtle perspective fog
 * - Mouse Parallax & Interactive Quantum Shockwave Physics on Click
 * - Real-Time Cryptographic Telemetry, Monad Block Metrics, and Cinematic Progress Sequence
 */
export default function ThreePreloader({
  onComplete,
  targetUrl = "/dashboard",
  autoEnter = false,
}) {
  const router = useRouter();
  const mountRef = useRef(null);
  const isWarpingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING PARALLEL ENCLAVE...");
  const [telemetryHash, setTelemetryHash] = useState("0x8f01fd3d...925c");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isWarping, setIsWarping] = useState(false);

  // Prefetch destination route for instantaneous Next.js client transition
  useEffect(() => {
    try {
      router.prefetch(targetUrl);
    } catch (_) {}
  }, [router, targetUrl]);

  // Technical boot milestones
  const stages = [
    { threshold: 18, text: "SPAWNING QUANTUM ISOLATION HYPERVISOR..." },
    { threshold: 38, text: "CONNECTING MONAD TESTNET RPC (CHAIN ID 10143)..." },
    { threshold: 58, text: "INITIALIZING AGENTFLOW NEURAL SWARM & RISK ENGINE..." },
    { threshold: 78, text: "ATTACHING 7-LAYER VERIFICATION MATRIX & ESCROW..." },
    { threshold: 94, text: "SYNCHRONIZING DETERMINISTIC AGENTWALLET BOUNDARIES..." },
    { threshold: 100, text: "ALL AGENTS SYNCHRONIZED. PARALLEL GATEWAY ONLINE." },
  ];

  useEffect(() => {
    // Generate streaming random cryptographic hashes in HUD
    const hashInterval = setInterval(() => {
      const randomHex = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      setTelemetryHash(`0x${randomHex}...${randomHex.slice(0, 4)}`);
    }, 180);

    return () => clearInterval(hashInterval);
  }, []);

  useEffect(() => {
    // Smooth progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          if (autoEnter && onComplete) onComplete();
          return 100;
        }
        // Organic progress curve
        const increment = prev < 40 ? 1.8 : prev < 75 ? 1.2 : prev < 95 ? 0.9 : 2.5;
        const nextVal = Math.min(100, prev + increment);

        // Update stage text
        const currentStage = stages.find((s) => nextVal <= s.threshold);
        if (currentStage) {
          setStatusText(currentStage.text);
        }

        return nextVal;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [autoEnter, onComplete]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene & Camera Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070614, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- 2. Lighting System ---
    const ambientLight = new THREE.AmbientLight(0x221144, 1.8);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0xff5a5f, 3.5, 30);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const monadLight = new THREE.PointLight(0x836ef9, 4, 35);
    monadLight.position.set(5, 5, 8);
    scene.add(monadLight);

    const cyanLight = new THREE.PointLight(0x00f2fe, 3, 25);
    cyanLight.position.set(-6, -4, 6);
    scene.add(cyanLight);

    // --- 3. Central 3D Quantum Proof Core ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Outer Faceted Proof Shield (Icosahedron Wireframe)
    const shieldGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x836ef9,
      wireframe: true,
      emissive: 0x220055,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    coreGroup.add(shieldMesh);

    // Inner Sacred Geometric Nucleus
    const innerGeo = new THREE.OctahedronGeometry(2.4, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xff5a5f,
      emissive: 0xff2244,
      emissiveIntensity: 0.8,
      metalness: 0.85,
      roughness: 0.15,
      transparent: true,
      opacity: 0.9,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Inner Glowing Core Sphere (The Light Source)
    const bulbGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    coreGroup.add(bulbMesh);

    // --- 4. Tilted Multi-Agent Planetary Orbital Rings ---
    const createRing = (radius, tube, color, tiltX, tiltZ) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.75,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.z = tiltZ;
      return ring;
    };

    // Orbit 1: Buyer Swarm Ring
    const orbitBuyer = createRing(5.6, 0.04, 0xff5a5f, Math.PI / 3.2, Math.PI / 6);
    scene.add(orbitBuyer);

    // Orbit 2: Verification Matrix Ring
    const orbitVerifier = createRing(6.8, 0.045, 0x00f2fe, -Math.PI / 2.8, Math.PI / 4);
    scene.add(orbitVerifier);

    // Orbit 3: Monad Settlement Escrow Ring
    const orbitEscrow = createRing(8.2, 0.05, 0x836ef9, Math.PI / 5, -Math.PI / 3);
    scene.add(orbitEscrow);

    // Orbiting Luminescent Agent Satellites
    const createAgentSatellite = (color, size) => {
      const satGeo = new THREE.SphereGeometry(size, 24, 24);
      const satMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.5,
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      const light = new THREE.PointLight(color, 2, 8);
      sat.add(light);
      return sat;
    };

    const satBuyer = createAgentSatellite(0xff5a5f, 0.35);
    const satVerifier = createAgentSatellite(0x00f2fe, 0.4);
    const satEscrow = createAgentSatellite(0x836ef9, 0.45);
    scene.add(satBuyer);
    scene.add(satVerifier);
    scene.add(satEscrow);

    // --- 5. Parallel Dimension Warp Particle Field (3,500 Stars) ---
    const particleCount = 3500;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xff5a5f), // Coral
      new THREE.Color(0x836ef9), // Monad Violet
      new THREE.Color(0x00f2fe), // Cyan
      new THREE.Color(0xffffff), // Pure Starlight
    ];

    for (let i = 0; i < particleCount; i++) {
      // Cylinder distribution along Z-axis for warp-depth feel
      const radius = 2 + Math.random() * 32;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // --- 6. Infinite Holographic Grid Floor ---
    const gridHelper = new THREE.GridHelper(160, 60, 0x836ef9, 0x1f1444);
    gridHelper.position.y = -9;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    scene.add(gridHelper);

    // --- 7. Interactive Mouse Parallax & Shockwave ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let shockwaveEnergy = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 2.5;
      targetY = -y * 2.5;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width - 0.5;
        const y = (touch.clientY - rect.top) / rect.height - 0.5;
        targetX = x * 2.5;
        targetY = -y * 2.5;
      }
    };

    const handleClick = () => {
      // Trigger a dimensional shockwave pulse
      shockwaveEnergy = 1.8;
    };

    const handleTouchStart = () => {
      shockwaveEnergy = 1.8;
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        handleLaunch();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    container.addEventListener("click", handleClick);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- 8. Master Animation Loop ---
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX * 2.5;
      camera.position.y = mouseY * 2.5;
      camera.lookAt(0, 0, 0);

      // Core rotations
      shieldMesh.rotation.x += delta * 0.45;
      shieldMesh.rotation.y += delta * 0.65;
      innerCore.rotation.y -= delta * 0.8;
      innerCore.rotation.z += delta * 0.5;

      // Pulse core scale
      const pulse = 1 + Math.sin(time * 3.5) * 0.06 + shockwaveEnergy;
      coreGroup.scale.set(pulse, pulse, pulse);
      if (shockwaveEnergy > 0) {
        shockwaveEnergy = Math.max(0, shockwaveEnergy - delta * 2.8);
      }

      // Rotate orbital rings
      orbitBuyer.rotation.z += delta * 0.35;
      orbitVerifier.rotation.y += delta * 0.4;
      orbitEscrow.rotation.x += delta * 0.25;

      // Satellite orbital motion along circular paths
      const speed1 = time * 1.6;
      satBuyer.position.set(
        Math.cos(speed1) * 5.6,
        Math.sin(speed1) * 5.6 * Math.cos(Math.PI / 3.2),
        Math.sin(speed1) * 5.6 * Math.sin(Math.PI / 3.2)
      );

      const speed2 = time * -1.2;
      satVerifier.position.set(
        Math.cos(speed2) * 6.8 * Math.cos(Math.PI / 4),
        Math.sin(speed2) * 6.8,
        Math.cos(speed2) * 6.8 * Math.sin(Math.PI / 4)
      );

      const speed3 = time * 0.9;
      satEscrow.position.set(
        Math.sin(speed3) * 8.2 * Math.cos(Math.PI / 5),
        Math.sin(speed3) * 8.2 * Math.sin(Math.PI / 5),
        Math.cos(speed3) * 8.2
      );

      // Starfield warp movement towards camera (reads ref for zero hitching)
      const posArr = particleGeo.attributes.position.array;
      const speedWarp = isWarpingRef.current ? 95 : 18 + shockwaveEnergy * 25;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 2] += delta * speedWarp;
        if (posArr[i * 3 + 2] > 25) {
          posArr[i * 3 + 2] = -175;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Slowly drift grid
      gridHelper.position.z = (time * 8) % 4;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchstart", handleTouchStart);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      shieldGeo.dispose();
      shieldMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  // Handle final Warp Transition into dashboard with Next.js client router
  const handleLaunch = () => {
    if (isWarpingRef.current) return;
    setIsWarping(true);
    isWarpingRef.current = true;
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        try {
          router.push(targetUrl);
        } catch (_) {
          window.location.href = targetUrl;
        }
      }
    }, 700);
  };

  return (
    <div className="relative w-full h-screen bg-[#070614] overflow-hidden select-none font-sans text-white">
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-pointer" />

      {/* Cyberpunk Vignette & Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(7,6,20,0.6) 70%, #070614 100%)",
        }}
      />

      {/* Top Protocol Telemetry Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 border-b border-white/10 backdrop-blur-md bg-black/25">
        <a href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
          <AgentProofLogo variant="full" size="sm" theme="dark" />
        </a>

        <div className="flex items-center gap-3 sm:gap-6 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-gray-400">NETWORK:</span>
            <span className="text-emerald-300 font-semibold">MONAD TESTNET (10143)</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-400">HASH:</span>
            <span className="text-purple-300 font-mono">{telemetryHash}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="text-gray-400">LATENCY:</span>
            <span className="text-cyan-300 font-bold">12ms</span>
          </div>
          <button
            onClick={handleLaunch}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF5A5F]/20 to-[#836EF9]/30 hover:from-[#FF5A5F]/40 hover:to-[#836EF9]/50 border border-[#836EF9]/50 text-xs font-mono text-gray-200 hover:text-white transition-all cursor-pointer shadow-md"
            title="Instant access without waiting"
          >
            <span>Fast Enter</span>
            <span className="material-symbols-outlined text-[14px] text-[#00F2FE]">bolt</span>
          </button>
        </div>
      </div>

      {/* Center Interactive Reticle Bracket HUD */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 border border-white/10 rounded-full animate-pulse">
          {/* Corner Framing Brackets */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#FF5A5F]" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#836EF9]" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#836EF9]" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#00F2FE]" />

          {/* Subtly Rotating Compass Ring */}
          <div className="absolute inset-4 border border-dashed border-white/15 rounded-full animate-spin-slow" />
        </div>
      </div>

      {/* Bottom Mission-Control Telemetry & Progress Deck */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 pt-6 backdrop-blur-xl bg-black/40 border-t border-white/10">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {/* Stage Status & Percentage readout */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono tracking-wider">
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span className="font-semibold">{statusText}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A5F] via-[#C04CFD] to-[#836EF9]">
              {Math.floor(progress)}%
            </div>
          </div>

          {/* Precision Holographic Progress Bar */}
          <div className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15">
            <div
              className="h-full rounded-full transition-all duration-150 ease-out relative"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #FF5A5F 0%, #C04CFD 50%, #836EF9 80%, #00F2FE 100%)",
                boxShadow: "0 0 16px rgba(131,110,249,0.8)",
              }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-sm" />
            </div>
          </div>

          {/* Verification Multi-Pillar Sub-metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-gray-400">
            <div className="bg-white/5 px-2.5 py-1.5 rounded border border-white/5 flex items-center justify-between">
              <span>AGENTS:</span>
              <span className="text-emerald-400 font-semibold">10 ONLINE</span>
            </div>
            <div className="bg-white/5 px-2.5 py-1.5 rounded border border-white/5 flex items-center justify-between">
              <span>VERIFIER:</span>
              <span className="text-cyan-300 font-semibold">7-LAYER PASS</span>
            </div>
            <div className="bg-white/5 px-2.5 py-1.5 rounded border border-white/5 flex items-center justify-between">
              <span>WALLET:</span>
              <span className="text-purple-300 font-semibold">0x7263...67FA</span>
            </div>
            <div className="bg-white/5 px-2.5 py-1.5 rounded border border-white/5 flex items-center justify-between">
              <span>ESCROW:</span>
              <span className="text-[#FF5A5F] font-semibold">0x0AEb...e9f1</span>
            </div>
          </div>

          {/* Action Launch Button (Reveals at 100%) */}
          {isCompleted && (
            <div className="mt-3 flex items-center justify-center animate-bounce">
              <button
                onClick={handleLaunch}
                disabled={isWarping}
                className="relative group px-8 py-3 rounded-xl font-mono text-sm uppercase tracking-widest font-extrabold text-white transition-all duration-300 shadow-2xl overflow-hidden cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #FF5A5F 0%, #836EF9 50%, #00F2FE 100%)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isWarping ? "WARPING TO PROTOCOL..." : "ENTER WORKSPACE"}
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Interaction Hint */}
      {!isCompleted && (
        <div className="absolute bottom-28 left-0 right-0 pointer-events-none z-20 flex justify-center">
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[11px] font-mono text-gray-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>CLICK ANYWHERE TO DISPERSE QUANTUM SHOCKWAVE • MOVE TO TILT</span>
          </div>
        </div>
      )}
    </div>
  );
}
