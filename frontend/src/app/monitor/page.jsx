
import React from 'react';
import Link from 'next/link';

export default function Monitor() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-container"><div className="h-16 w-full px-gutter flex items-center justify-between"><div className="flex items-center gap-space-md"><img alt="AgentProof Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UtHf8oOF7fpui2t5a8XHYBUKK1hPA7aojbputIJ7-vIK70l4wn_-gVrXL6jjUbQS6dtxQqET98K1RkDy66mpa8sS5b_98Zxicc9reYuomRQTrT_LcieztTSZs2fA73tDnzsjMA3MnNzHNmYLtXFnCB1m9NvCTyxZsRwu_kGdSaoEjZdaMsvK1i5i2_R9_j5qi8U6nNbyAiPMMbRznZRpwhqzGYvkf3u-NEtY1I8APNSlGLHo-UCNipKA"/><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">AgentProof</span></div><nav className="hidden md:flex items-center gap-gutter" data-active-classes="text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1"><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="tasks" href="/dashboard">Tasks</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="marketplace" href="/marketplace">Marketplace</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="agentflow-policy" href="#">AgentFlow Policy</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="wallet-escrow" href="#">Wallet Escrow</Link></nav><div className="flex items-center gap-space-md"><div className="hidden sm:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container"><span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span><span className="font-label-sm text-label-sm text-on-surface">Monad Devnet</span></div><div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container hover:bg-surface-container transition-colors cursor-pointer"><span className="font-label-sm text-label-sm font-semibold text-on-surface">14.50 MON</span><span className="font-body-sm text-body-sm text-secondary">|</span><span className="font-label-sm text-label-sm text-secondary font-mono">0x71C...4f9b</span></div><div className="flex items-center pl-space-xs"><img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BEV8p1SJGFqsOSr1Sw1je0DEOTYVeDQn8C8yWGoftlnGjA1ah5d9CP7nl6PSRnktAgr2XlHV6ktwSrXWKMI05feUb_PGTTJABTnE5_cTznLS6inLbnmXbQIH0mX-Wn6h0_z4Z6UnnES7jepcvx9O5Wrm59wdC_h-LTTSiMo_fmjZKhSrHWTLfZt7V5Cxgwt9h3IVEnX3_mGFEW0HwXCZHgrNmowUj0cmYaOLcO77l58anHK8i3UK"/></div></div></div></header><aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-surface-container z-40 flex flex-col justify-between py-space-lg px-space-md overflow-y-auto"><div className="flex flex-col gap-space-lg"><div className="px-space-md"><p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Economic Workspace</p></div><nav className="flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary font-semibold shadow-sm"><Link aria-current="page" className="flex items-center gap-space-md px-space-md py-2.5 rounded-full transition-all group bg-primary-container text-on-primary font-semibold shadow-sm" data-path="live-execution-monitor" href="/monitor"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">monitoring</span><span className="font-label-md text-label-md">Execution Monitor</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="autonomous-agents" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">smart_toy</span><span className="font-label-md text-label-md">Registered Agents</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="proof-verification" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">verified_user</span><span className="font-label-md text-label-md">Zero-Knowledge Proofs</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="liquidity-escrow-vaults" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">account_balance_wallet</span><span className="font-label-md text-label-md">Escrow Vaults</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="dispute-arbitration" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">gavel</span><span className="font-label-md text-label-md">Arbitration &amp; Slashing</span></Link></nav></div><div className="flex flex-col gap-space-md px-space-md pt-space-lg border-t border-surface-container"><div className="flex items-center justify-between"><div className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span><span className="font-label-sm text-label-sm text-secondary">Consensus Active</span></div><span className="font-label-sm text-label-sm font-mono text-on-surface-variant">v1.4.2</span></div><p className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Network</p></div></aside><div className="pl-64"><main className="w-full min-h-screen pt-16 bg-surface"><div className="flex flex-col w-full">
<div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md">

<div className="flex items-center justify-between pb-space-md">
<div className="flex items-center gap-space-sm">
<Link className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-lowest shadow-sm hover:bg-surface-container transition-colors text-secondary hover:text-on-surface" href="#">
<span className="material-symbols-outlined text-[18px]">arrow_back</span>
<span className="font-label-sm text-label-sm">Back to Tasks</span>
</Link>
<span className="font-body-sm text-body-sm text-secondary px-1">/</span>
<span className="font-label-sm text-label-sm text-secondary font-mono tracking-tight">TSK-8924-MND</span>
</div>
<div className="flex items-center gap-space-sm">
<div className="flex items-center gap-2 px-space-md py-1.5 rounded-full bg-surface-container-lowest shadow-sm">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
</span>
<span className="font-label-sm text-label-sm font-semibold text-on-surface">Live Executing</span>
</div>
<div className="hidden sm:flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-lowest text-secondary shadow-sm">
<span className="material-symbols-outlined text-[16px] text-tertiary">hub</span>
<span className="font-label-sm text-label-sm font-mono text-tertiary">Monad Node #42</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

<div className="lg:col-span-5 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm relative overflow-hidden">
<div className="absolute -right-12 -top-12 w-36 h-36 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="px-space-sm py-0.5 rounded-full bg-primary-container/10 text-primary-container font-label-sm text-label-sm tracking-wide uppercase">Autonomous Cycle</span>
<span className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">schedule</span> 4 mins ago
              </span>
</div>
<h1 className="font-headline-md text-headline-md text-on-surface tracking-tight leading-snug">
              Competitor Pricing Research &amp; Scraping
            </h1>
<div className="pt-space-xs flex flex-wrap items-center gap-y-2 gap-x-space-md font-body-sm text-body-sm text-secondary">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">tag</span>
<span className="font-mono text-on-surface font-medium">#TSK-8924-MND</span>
</div>
<span className="text-surface-variant">•</span>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-tertiary">smart_toy</span>
<span className="font-mono text-on-surface font-medium">0x93b2...77e</span>
<button className="hover:text-on-surface p-0.5" onclick="navigator.clipboard.writeText('0x93b294c718fa40debc120938477e')" title="Copy agent address">
<span className="material-symbols-outlined text-[14px]">content_copy</span>
</button>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md relative">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-surface">
<span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
</div>
<div>
<h3 className="font-label-md text-label-md text-on-surface">Escrow Financials</h3>
<p className="font-body-sm text-body-sm text-secondary">Contract Locked: 0x4a8...d91</p>
</div>
</div>
<div className="text-right">
<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">0.070 MON</span>
<p className="font-label-sm text-label-sm text-tertiary">Total Escrow</p>
</div>
</div>

<div className="grid grid-cols-2 gap-space-sm pt-space-xs">
<div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">Bounty Reward</span>
<span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
</div>
<span className="font-label-md text-label-md font-semibold text-on-surface">0.050 MON</span>
<span className="font-label-sm text-label-sm text-secondary">Held for final proof</span>
</div>
<div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">Service Budget</span>
<span className="material-symbols-outlined text-[16px] text-tertiary">bolt</span>
</div>
<span className="font-label-md text-label-md font-semibold text-on-surface">0.020 MON</span>
<div className="flex items-center justify-between font-label-sm text-label-sm text-secondary">
<span>0.008 spent</span>
<span className="text-primary-container font-medium">0.012 left</span>
</div>
</div>
</div>

<div className="flex flex-col gap-1.5 pt-space-xs">
<div className="flex justify-between items-center font-label-sm text-label-sm">
<span className="text-secondary">Execution Budget Consumption (40%)</span>
<span className="font-mono text-on-surface">0.008 / 0.020 MON</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{width: '40%'}}></div>
</div>
</div>

<div className="p-space-md rounded-lg bg-tertiary-container/10 flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-tertiary text-[20px]">security</span>
<div>
<p className="font-label-sm text-label-sm font-semibold text-on-surface">AgentFlow Policy Active</p>
<p className="font-body-sm text-body-sm text-secondary">Max limit 0.005 MON per individual API invoke</p>
</div>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest text-tertiary font-label-sm text-label-sm shadow-sm">Strict Enforce</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[20px] text-secondary">receipt_long</span>
<h3 className="font-label-md text-label-md text-on-surface">Micropayment Stream</h3>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-mono">3 Txns</span>
</div>
<div className="flex flex-col gap-space-xs">

<div className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-md">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
<span className="material-symbols-outlined text-[16px]">travel_explore</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm font-semibold text-on-surface">WebScrapePro API</span>
<span className="font-body-sm text-body-sm text-secondary font-mono">Payload: 2.4 MB • HTTP 200</span>
</div>
</div>
<div className="text-right flex flex-col items-end">
<span className="font-label-sm text-label-sm font-mono font-semibold text-primary">-0.003 MON</span>
<span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
<span className="material-symbols-outlined text-[12px]">done_all</span> Settled
                </span>
</div>
</div>

<div className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-md">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
<span className="material-symbols-outlined text-[16px]">currency_exchange</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm font-semibold text-on-surface">CurrencyRateAPI</span>
<span className="font-body-sm text-body-sm text-secondary font-mono">FX Matrix FX-USD • HTTP 200</span>
</div>
</div>
<div className="text-right flex flex-col items-end">
<span className="font-label-sm text-label-sm font-mono font-semibold text-primary">-0.001 MON</span>
<span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
<span className="material-symbols-outlined text-[12px]">done_all</span> Settled
                </span>
</div>
</div>

<div className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between">
<div className="flex items-center gap-space-md">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
<span className="material-symbols-outlined text-[16px]">neurology</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm font-semibold text-on-surface">LLM Reasoning Node</span>
<span className="font-body-sm text-body-sm text-secondary font-mono">Llama-3-70b-Quant • HTTP 200</span>
</div>
</div>
<div className="text-right flex flex-col items-end">
<span className="font-label-sm text-label-sm font-mono font-semibold text-primary">-0.004 MON</span>
<span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
<span className="material-symbols-outlined text-[12px]">done_all</span> Settled
                </span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">Autonomous Controls</span>
<span className="font-label-sm text-label-sm text-secondary font-mono">Signer: 0x71C...4f9b</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
<button className="w-full py-2.5 px-space-md rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm" id="btnPauseAgent">
<span className="material-symbols-outlined text-[18px]">pause_circle</span>
              Pause Agent
            </button>
<button className="w-full py-2.5 px-space-md rounded-full bg-error/10 hover:bg-error/15 text-error font-label-md text-label-md transition-all flex items-center justify-center gap-2 active:scale-95" id="btnAbortEscrow">
<span className="material-symbols-outlined text-[18px]">cancel</span>
              Abort &amp; Refund
            </button>
</div>
</div>
</div>

<div className="lg:col-span-7 flex flex-col gap-space-md">

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">

<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm gap-y-2">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Agent Execution Timeline</h2>
<p className="font-body-sm text-body-sm text-secondary">Real-time state transitions verified on Monad consensus</p>
</div>
<div className="flex items-center gap-2 px-space-md py-1.5 rounded-full bg-surface-container-low self-start sm:self-auto">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
<span className="font-label-sm text-label-sm text-secondary font-mono">ws://monad-rpc •</span>
<span className="font-label-sm text-label-sm font-semibold text-tertiary font-mono">12ms latency</span>
</div>
</div>

<div className="relative flex flex-col gap-space-lg pl-2">

<div className="absolute left-6 top-4 bottom-8 w-0.5 bg-surface-container-high -translate-x-1/2 pointer-events-none"></div>

<div className="relative flex items-start gap-space-md group">
<div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<div className="flex-1 bg-surface-container-low p-space-md rounded-xl transition-all group-hover:bg-surface-container">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-label-md font-semibold text-on-surface">Task Created &amp; Funds Locked</h4>
<span className="font-body-sm text-body-sm text-secondary font-mono">11:42:01.082</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-1">
                  0.070 MON locked in <span className="font-mono text-on-surface">AgentEscrow</span> contract (<span className="font-mono text-secondary">0x4a8...d91</span>). Gas cost: 0.00018 MON.
                </p>
<div className="mt-2 inline-flex items-center gap-1.5 font-label-sm text-label-sm text-tertiary">
<span className="material-symbols-outlined text-[14px]">verified</span>
                  Monad Block #18,492,019
                </div>
</div>
</div>

<div className="relative flex items-start gap-space-md group">
<div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<div className="flex-1 bg-surface-container-low p-space-md rounded-xl transition-all group-hover:bg-surface-container">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-label-md font-semibold text-on-surface">Agent Discovers Service in Marketplace</h4>
<span className="font-body-sm text-body-sm text-secondary font-mono">11:42:15.340</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-1">
                  Matched endpoint <span className="font-medium text-on-surface">'WebScrapePro High-Speed Scraper'</span> via decentralized registry matching filter criteria.
                </p>
<div className="mt-2 flex items-center gap-2">
<span className="px-space-sm py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm font-mono">Service ID: #WSP-992</span>
<span className="font-body-sm text-body-sm text-secondary">• SLA 99.98%</span>
</div>
</div>
</div>

<div className="relative flex items-start gap-space-md group">
<div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<div className="flex-1 bg-surface-container-low p-space-md rounded-xl transition-all group-hover:bg-surface-container">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-label-md font-semibold text-on-surface">HTTP 402 Payment Required (0.003 MON Invoice)</h4>
<span className="font-body-sm text-body-sm text-secondary font-mono">11:42:22.910</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-1">
                  Received L402 challenge header from provider with Monad micropayment preimage hash: <span className="font-mono text-on-surface">0xa4f889...e302</span>.
                </p>
</div>
</div>

<div className="relative flex items-start gap-space-md group">
<div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<div className="flex-1 bg-surface-container-low p-space-md rounded-xl transition-all group-hover:bg-surface-container">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-label-md font-semibold text-on-surface">AgentFlow Policy Check (Approved)</h4>
<span className="font-body-sm text-body-sm text-secondary font-mono">11:42:23.012</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-1">
                  Pre-flight check against user budget rules (0.003 ≤ 0.005 MON cap). Policy invariant verified cryptographically within <span className="font-mono font-medium text-tertiary">14ms</span>.
                </p>
</div>
</div>

<div className="relative flex items-start gap-space-md group">
<div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-sm">
<span className="material-symbols-outlined text-[18px]">check</span>
</div>
<div className="flex-1 bg-surface-container-low p-space-md rounded-xl transition-all group-hover:bg-surface-container">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-label-md font-semibold text-on-surface">AgentWallet Pays Provider</h4>
<span className="font-body-sm text-body-sm text-secondary font-mono">11:42:24.115</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-1">
                  0.003 MON settled via high-throughput state channel. Preimage unlocked data stream with HTTP 200 payload return.
                </p>
</div>
</div>

<div className="relative flex items-start gap-space-md">

<div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md ring-4 ring-primary-container/25 animate-pulse">
<span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
</div>

<div className="flex-1 bg-surface-container-lowest p-space-lg rounded-xl shadow-md border-l-4 border-l-primary-container flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="px-space-sm py-0.5 rounded-full bg-primary-container/10 text-primary-container font-label-sm text-label-sm font-semibold tracking-wide uppercase">In Progress</span>
<h4 className="font-label-md text-label-md font-bold text-on-surface">Evaluator Validates Result &amp; Signs Proof</h4>
</div>
<span className="font-body-sm text-body-sm text-primary-container font-mono font-medium">Running...</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                  Independent evaluator node running decentralized zk-STARK verification on scraped competitor dataset hash. Ensuring data integrity against schema invariants.
                </p>

<div className="mt-2 p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs font-mono text-body-sm">
<div className="flex justify-between items-center">
<span className="text-secondary font-label-sm text-label-sm">zk-STARK Prover Cluster</span>
<span className="text-primary-container font-label-sm text-label-sm font-semibold">Stage 3/4 (Synthesizing Trace)</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full w-3/4 animate-pulse"></div>
</div>
<div className="flex justify-between items-center font-label-sm text-label-sm text-secondary pt-1">
<span>Hash: 0x7c9b...41e0</span>
<span>Constraint Satisfaction: 98.4%</span>
</div>
</div>

<div className="flex items-center gap-2 pt-1 font-body-sm text-body-sm text-secondary">
<span className="material-symbols-outlined text-[16px] text-tertiary">fingerprint</span>
<span className="font-mono text-on-surface">Verifier: 0xEvaluatorNode#9</span>
<span className="text-surface-variant">•</span>
<span>Est. completion: ~18s</span>
</div>
</div>
</div>

<div className="relative flex items-start gap-space-md opacity-60">
<div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-high text-secondary flex items-center justify-center shadow-none">
<span className="material-symbols-outlined text-[18px]">lock_clock</span>
</div>
<div className="flex-1 bg-surface-container-low p-space-md rounded-xl">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-label-md font-medium text-secondary">AgentEscrow Settles Funds</h4>
<span className="font-body-sm text-body-sm text-secondary font-mono">Queued</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-1">
                  Final atomic release of 0.050 MON bounty to agent address upon cryptographic validation of the zero-knowledge attestation.
                </p>
</div>
</div>
</div>
</div>

<div className="bg-inverse-surface rounded-xl p-space-lg text-inverse-on-surface shadow-sm flex flex-col gap-space-sm font-mono text-body-sm">
<div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/20">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed-dim">RPC Agent Daemon Output</span>
</div>
<span className="font-label-sm text-label-sm text-secondary-fixed-dim">STDOUT • Live</span>
</div>
<div className="flex flex-col gap-1 text-[13px] leading-relaxed overflow-x-auto text-secondary-fixed-dim">
<p><span className="text-tertiary-fixed font-semibold">[11:42:25.02]</span> <span className="text-on-tertiary">EXEC:</span> HTTP GET https://api.webscrapepro.eth/v2/jobs/992 completed with 200 OK</p>
<p><span className="text-tertiary-fixed font-semibold">[11:42:26.89]</span> <span className="text-on-tertiary">DATA:</span> 48 items normalized into JSON format. Integrity digest computed.</p>
<p><span className="text-tertiary-fixed font-semibold">[11:42:28.14]</span> <span className="text-primary-fixed-dim">ZK_GEN:</span> Initializing zk-STARK trace table for pricing validator node...</p>
<p className="text-primary-container animate-pulse"><span className="text-tertiary-fixed font-semibold">[11:42:31.40]</span> &gt;&gt; Evaluator 0xEvNode9 listening for constraint verification root...</p>
</div>
</div>
</div>
</div>
</div>

</div></main><footer className="w-full bg-surface-container-lowest border-t border-surface-container py-space-md px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><div className="flex items-center gap-space-md"><span className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Foundation. Autonomous Economic Layer.</span></div><div className="flex items-center gap-space-lg"><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Consensus Docs</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Security Audits</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">API RPC</Link></div></footer></div>
    </>
  );
}
