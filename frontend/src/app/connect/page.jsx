
import React from 'react';
import Link from 'next/link';

export default function Connect() {
  return (
    <>
      <main className="w-full min-h-screen flex items-center justify-center p-gutter"><div className="flex flex-col w-full items-center justify-center py-6 px-4 relative">
<div className="absolute -top-16 -left-12 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
<div className="absolute -bottom-20 -right-16 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none"></div>
<div className="w-full max-w-lg bg-surface-container-lowest rounded-[20px] shadow-xl overflow-hidden relative z-10 transition-all duration-300">
<div className="flex items-center justify-between px-space-lg pt-space-lg pb-space-sm">
<button aria-label="Close dialog" className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-on-surface transition-colors cursor-pointer group" type="button">
<span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">close</span>
</button>
<div className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-full">
<div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: '"FILL" 1'}}>bolt</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface tracking-wide">AgentProof</span>
</div>
<div className="w-9 h-9 flex items-center justify-center">
<span className="relative flex h-2.5 w-2.5">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
</span>
</div>
</div>
<div className="px-space-lg pt-space-sm pb-space-md text-center">
<h1 className="font-headline-md text-headline-md text-on-surface">Welcome to AgentProof</h1>
<p className="font-body-md text-body-md text-on-secondary-container mt-1 max-w-sm mx-auto">
        Connect your Web3 identity to fund autonomous tasks or monetize agent services on Monad.
      </p>
</div>
<div className="px-space-lg space-y-space-md">
<div className="space-y-space-sm">
<label className="font-label-sm text-label-sm uppercase tracking-wider text-on-secondary-container block text-center">Select your workspace mode</label>
<div className="grid grid-cols-1 gap-space-sm" id="role-selector-container">
<div className="role-card relative p-space-md rounded-xl bg-primary-fixed/20 cursor-pointer transition-all duration-200" id="role-creator" onclick="selectRole('creator')">
<div className="flex items-start gap-space-md">
<div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: '"FILL" 1'}}>smart_toy</span>
</div>
<div className="flex-1 min-w-0 pr-6">
<div className="flex items-center gap-space-xs">
<h3 className="font-label-md text-label-md text-on-surface">Task Creator &amp; Orchestrator</h3>
<span className="font-label-sm text-label-sm px-2 py-0.5 bg-primary-container/15 text-primary-container rounded-full">Popular</span>
</div>
<p className="font-body-sm text-body-sm text-on-secondary-container mt-1">
                  Deploy tasks, set spending limits, and fund cryptographically verified escrows for AI agents.
                </p>
</div>
<div className="absolute top-4 right-4 text-primary-container" id="icon-creator">
<span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
</div>
</div>
</div>
<div className="role-card relative p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all duration-200" id="role-provider" onclick="selectRole('provider')">
<div className="flex items-start gap-space-md">
<div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[20px]">terminal</span>
</div>
<div className="flex-1 min-w-0 pr-6">
<div className="flex items-center gap-space-xs">
<h3 className="font-label-md text-label-md text-on-surface">Service Provider &amp; API Developer</h3>
</div>
<p className="font-body-sm text-body-sm text-on-secondary-container mt-1">
                  Publish pay-per-request endpoints and stream instant micropayments via HTTP 402 protocols.
                </p>
</div>
<div className="absolute top-4 right-4 text-outline hidden" id="icon-provider">
<span className="material-symbols-outlined text-[22px]">radio_button_unchecked</span>
</div>
</div>
</div>
</div>
</div>
<div className="relative py-2 flex items-center justify-center">
<div className="w-full h-px bg-surface-variant"></div>
<span className="absolute px-3 bg-surface-container-lowest font-label-sm text-label-sm text-on-secondary-container tracking-wide uppercase">Authenticate</span>
</div>
<div className="space-y-space-sm">
<button className="w-full flex items-center justify-center gap-space-sm py-3.5 px-space-lg rounded-full bg-primary-container hover:bg-[#e0484d] text-on-primary font-label-md text-label-md shadow-md hover:shadow-lg active:scale-[0.985] transition-all cursor-pointer" id="monad-connect-btn" onclick="triggerConnect('monad')" type="button">
<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">

</svg>
<span id="btn-text">Connect Monad Wallet</span>
</button>
<button className="w-full flex items-center justify-center gap-space-sm py-3.5 px-space-lg rounded-full bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md shadow-sm active:scale-[0.985] transition-all cursor-pointer" onclick="triggerConnect('social')" type="button">
<span className="material-symbols-outlined text-[20px] text-on-secondary-container">fingerprint</span>
<span>Continue with Passkey or Email</span>
</button>
</div>
<div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-2 h-2 rounded-full bg-tertiary shrink-0"></div>
<span className="font-body-sm text-body-sm text-on-secondary-container truncate">Monad Devnet RPC</span>
</div>
<div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary shrink-0">
<span className="material-symbols-outlined text-[14px]">local_gas_station</span>
<span>Sponsored Free Gas</span>
</div>
</div>
</div>
<div className="px-space-lg py-space-md bg-surface-container-low text-center">
<p className="font-body-sm text-body-sm text-on-secondary-container max-w-xs mx-auto">
        By connecting, you agree to the <Link className="underline hover:text-on-surface transition-colors font-label-sm" href="#">Autonomous Settlement Protocol Terms</Link>.
      </p>
</div>
</div>
<div className="w-full max-w-lg mt-space-md flex items-center justify-between px-space-sm">
<div className="flex items-center gap-space-xs text-on-secondary-container">
<span className="material-symbols-outlined text-[16px]">verified_user</span>
<span className="font-label-sm text-label-sm">zk-SNARK Task Attestation Ready</span>
</div>
<div className="flex items-center gap-space-xs text-on-secondary-container">
<span className="material-symbols-outlined text-[16px]">speed</span>
<span className="font-label-sm text-label-sm">10,000 TPS Consensus</span>
</div>
</div>
</div>
</main>
    </>
  );
}
