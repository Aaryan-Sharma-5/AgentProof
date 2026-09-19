import React from 'react';
import Link from 'next/link';
import AgentProofLogo from '../components/AgentProofLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070614] text-white flex flex-col items-center justify-center p-6 font-sans">
      <AgentProofLogo variant="compact" size="lg" theme="dark" />
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A5F] via-[#C04CFD] to-[#836EF9] mt-8">
        404
      </h1>
      <p className="text-gray-400 font-mono text-sm mt-3 uppercase tracking-wider">
        Parallel Dimensional Coordinate Not Found
      </p>
      <div className="flex gap-4 mt-8">
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#836EF9] hover:bg-[#725aeb] transition-all text-white"
        >
          RETURN TO DASHBOARD
        </Link>
        <Link
          href="/preloader"
          className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/15 transition-all text-gray-200 border border-white/10"
        >
          3D PRELOADER
        </Link>
      </div>
    </div>
  );
}
