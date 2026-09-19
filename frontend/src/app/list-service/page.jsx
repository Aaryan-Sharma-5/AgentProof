
import React from 'react';
import Link from 'next/link';

export default function ListService() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-container"><div className="h-16 w-full px-gutter flex items-center justify-between"><div className="flex items-center gap-space-md"><img alt="AgentProof Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UtHf8oOF7fpui2t5a8XHYBUKK1hPA7aojbputIJ7-vIK70l4wn_-gVrXL6jjUbQS6dtxQqET98K1RkDy66mpa8sS5b_98Zxicc9reYuomRQTrT_LcieztTSZs2fA73tDnzsjMA3MnNzHNmYLtXFnCB1m9NvCTyxZsRwu_kGdSaoEjZdaMsvK1i5i2_R9_j5qi8U6nNbyAiPMMbRznZRpwhqzGYvkf3u-NEtY1I8APNSlGLHo-UCNipKA"/><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">AgentProof</span></div><nav className="hidden md:flex items-center gap-gutter" data-active-classes="text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1"><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="tasks" href="/dashboard">Tasks</Link><Link aria-current="page" className="transition-colors text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1" data-path="marketplace" href="/marketplace">Marketplace</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="agentflow-policy" href="#">AgentFlow Policy</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="wallet-escrow" href="#">Wallet Escrow</Link></nav><div className="flex items-center gap-space-md"><div className="hidden sm:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container"><span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span><span className="font-label-sm text-label-sm text-on-surface">Monad Devnet</span></div><div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container hover:bg-surface-container transition-colors cursor-pointer"><span className="font-label-sm text-label-sm font-semibold text-on-surface">14.50 MON</span><span className="font-body-sm text-body-sm text-secondary">|</span><span className="font-label-sm text-label-sm text-secondary font-mono">0x71C...4f9b</span></div><div className="flex items-center pl-space-xs"><img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BEV8p1SJGFqsOSr1Sw1je0DEOTYVeDQn8C8yWGoftlnGjA1ah5d9CP7nl6PSRnktAgr2XlHV6ktwSrXWKMI05feUb_PGTTJABTnE5_cTznLS6inLbnmXbQIH0mX-Wn6h0_z4Z6UnnES7jepcvx9O5Wrm59wdC_h-LTTSiMo_fmjZKhSrHWTLfZt7V5Cxgwt9h3IVEnX3_mGFEW0HwXCZHgrNmowUj0cmYaOLcO77l58anHK8i3UK"/></div></div></div></header><aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-surface-container z-40 flex flex-col justify-between py-space-lg px-space-md overflow-y-auto"><div className="flex flex-col gap-space-lg"><div className="px-space-md"><p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Economic Workspace</p></div><nav className="flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary font-semibold shadow-sm"><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="live-execution-monitor" href="/monitor"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">monitoring</span><span className="font-label-md text-label-md">Execution Monitor</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="autonomous-agents" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">smart_toy</span><span className="font-label-md text-label-md">Registered Agents</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="proof-verification" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">verified_user</span><span className="font-label-md text-label-md">Zero-Knowledge Proofs</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="liquidity-escrow-vaults" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">account_balance_wallet</span><span className="font-label-md text-label-md">Escrow Vaults</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="dispute-arbitration" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">gavel</span><span className="font-label-md text-label-md">Arbitration &amp; Slashing</span></Link></nav></div><div className="flex flex-col gap-space-md px-space-md pt-space-lg border-t border-surface-container"><div className="flex items-center justify-between"><div className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span><span className="font-label-sm text-label-sm text-secondary">Consensus Active</span></div><span className="font-label-sm text-label-sm font-mono text-on-surface-variant">v1.4.2</span></div><p className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Network</p></div></aside><div className="pl-64"><main className="w-full min-h-screen pt-16 bg-surface"><div className="flex flex-col w-full">
<div className="relative w-full max-w-5xl mx-auto px-gutter py-space-xl">

<div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-fixed rounded-full filter blur-3xl opacity-30 pointer-events-none -z-10"></div>
<div className="absolute top-80 right-10 w-72 h-72 bg-tertiary-fixed rounded-full filter blur-3xl opacity-20 pointer-events-none -z-10"></div>

<div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">

<nav className="flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm shadow-sm mb-space-md">
<Link className="hover:text-on-surface transition-colors" href="#">Marketplace</Link>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Register New Endpoint</span>
</nav>
<h1 className="font-display text-display text-on-surface tracking-tight leading-tight">
        List Your Service API
      </h1>
<p className="mt-space-sm font-body-lg text-body-lg text-secondary max-w-xl">
        Monetize your endpoints with autonomous AI agents. Get paid instantly per <span className="font-mono text-primary font-medium">HTTP 402</span> request via ultra-fast Monad micro-channels.
      </p>

<div className="mt-space-md flex flex-wrap items-center justify-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
<span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
<span>Zero Slashing Risks</span>
</div>
<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
<span className="material-symbols-outlined text-primary-container text-[18px]">bolt</span>
<span>Sub-Second Micro-Settlement</span>
</div>
<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
<span className="material-symbols-outlined text-secondary text-[18px]">lock_clock</span>
<span>Escrow Backed</span>
</div>
</div>
</div>

<form className="max-w-2xl mx-auto flex flex-col gap-space-xl" id="endpointForm" onsubmit="event.preventDefault(); handleRegistration();">

<div className="flex items-center justify-between px-space-md py-space-sm rounded-full bg-surface-container shadow-sm">
<div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold">
<span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs">1</span>
<span>Metadata</span>
</div>
<div className="w-8 h-0.5 bg-surface-container-highest"></div>
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span className="w-6 h-6 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-xs">2</span>
<span>Protocol</span>
</div>
<div className="w-8 h-0.5 bg-surface-container-highest"></div>
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span className="w-6 h-6 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-xs">3</span>
<span>Pricing</span>
</div>
<div className="w-8 h-0.5 bg-surface-container-highest"></div>
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span className="w-6 h-6 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center text-xs">4</span>
<span>Preview</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md flex flex-col gap-space-lg transition-all duration-300 hover:shadow-xl relative overflow-hidden">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Step 01 • Service Profile</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Service Details</h2>
</div>
<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
<span className="material-symbols-outlined text-[20px]">layers</span>
</div>
</div>
<div className="flex flex-col gap-space-md">

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="serviceName">
<span>Service Name <span className="text-primary">*</span></span>
<span className="font-body-sm text-body-sm text-secondary">Public Agent Index</span>
</label>
<div className="relative">
<input className="w-full bg-surface-container-low px-space-md py-3 rounded-lg font-body-md text-body-md text-on-surface placeholder-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-on-surface transition-all" id="serviceName" name="serviceName" oninput="updatePreview()" placeholder="e.g., Monad DEX Real-Time Liquidity Stream" required="" type="text"/>
<span className="material-symbols-outlined absolute right-3 top-3 text-secondary text-[20px]">hub</span>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface" htmlFor="category">
              Category <span className="text-primary">*</span>
</label>
<div className="relative">
<select className="w-full bg-surface-container-low px-space-md py-3 rounded-lg font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-on-surface transition-all cursor-pointer" id="category" name="category">
<option value="Financial Data &amp; Oracles">Financial Data &amp; Oracles</option>
<option value="Web Scraping">Web Scraping &amp; Real-time Crawlers</option>
<option value="Compute &amp; Reasoning">Compute &amp; Reasoning (DeepSeek / Llama3)</option>
<option value="Sensor / IoT">Sensor / IoT &amp; Physical Infrastructure</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-3 text-secondary pointer-events-none text-[20px]">expand_more</span>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="description">
<span>Description <span className="text-primary">*</span></span>
<span className="font-body-sm text-body-sm text-secondary">Schema &amp; Latency</span>
</label>
<textarea className="w-full bg-surface-container-low p-space-md rounded-lg font-body-md text-body-md text-on-surface placeholder-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-on-surface transition-all resize-y" id="description" name="description" placeholder="Describe the input schema, returned data format, and latency guarantees (e.g., 20ms p99 via WebSocket/JSON-RPC)." required="" rows="4"></textarea>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md flex flex-col gap-space-lg transition-all duration-300 hover:shadow-xl">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Step 02 • Connectivity</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Technical Integration</h2>
</div>
<div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
<span className="material-symbols-outlined text-[20px]">terminal</span>
</div>
</div>
<div className="flex flex-col gap-space-md">

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface" htmlFor="endpointUrl">
              Endpoint URL <span className="text-primary">*</span>
</label>
<div className="flex rounded-lg overflow-hidden bg-surface-container-low focus-within:ring-2 focus-within:ring-on-surface transition-all">
<span className="px-space-md py-3 font-mono font-label-sm text-label-sm bg-surface-container-high text-secondary flex items-center select-none">POST</span>
<input className="w-full bg-transparent px-space-md py-3 font-mono font-body-sm text-body-sm text-on-surface focus:outline-none" id="endpointUrl" name="endpointUrl" oninput="updatePreview()" placeholder="https://api.provider.network/v1/query" required="" type="url" value="https://api.provider.network/v1/query"/>
</div>
</div>

<div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low transition-colors">
<div className="flex items-start gap-space-md">
<div className="p-2 rounded-lg bg-surface-container-highest text-primary-container mt-0.5">
<span className="material-symbols-outlined text-[22px]">toll</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Native HTTP 402 Payment-Required Header</span>
<span className="font-body-sm text-body-sm text-secondary">Returns Lightning/Monad micro-invoice on unauthenticated or unpaid requests.</span>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer select-none">
<input checked="" className="sr-only peer" id="toggle402" onchange="toggleProtocolNotice()" type="checkbox"/>
<div className="w-12 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
</label>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="healthUrl">
<span>Health Check URL <span className="text-primary">*</span></span>
<span className="font-body-sm text-body-sm text-tertiary flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                Ping frequency: 15s
              </span>
</label>
<div className="flex rounded-lg overflow-hidden bg-surface-container-low focus-within:ring-2 focus-within:ring-on-surface transition-all">
<span className="px-space-md py-3 font-mono font-label-sm text-label-sm bg-surface-container-high text-secondary flex items-center select-none">GET</span>
<input className="w-full bg-transparent px-space-md py-3 font-mono font-body-sm text-body-sm text-on-surface focus:outline-none" id="healthUrl" name="healthUrl" placeholder="https://api.provider.network/health" required="" type="url" value="https://api.provider.network/health"/>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md flex flex-col gap-space-lg transition-all duration-300 hover:shadow-xl">
<div className="flex items-start justify-between">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Step 03 • Monetization</span>
<h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">Pricing &amp; Monad Escrow Payout</h2>
</div>
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="costPerRequest">
<span>Cost Per Request <span className="text-primary">*</span></span>
<span className="font-body-sm text-body-sm text-tertiary" id="fiatEstimate">~$0.92 / 1k calls</span>
</label>
<div className="relative">
<input className="w-full bg-surface-container-low px-space-md py-3 rounded-lg font-mono font-label-md text-label-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-on-surface transition-all" id="costPerRequest" name="costPerRequest" oninput="updateFiatEquiv(this.value)" placeholder="0.0025 MON" required="" type="text" value="0.0025 MON"/>
<span className="absolute right-3 top-3 font-label-sm text-label-sm font-bold text-primary">MON</span>
</div>
</div>

<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface" htmlFor="rateLimit">
              Rate Limit Quota <span className="text-primary">*</span>
</label>
<div className="relative">
<input className="w-full bg-surface-container-low px-space-md py-3 rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-on-surface transition-all" id="rateLimit" name="rateLimit" placeholder="100 req/sec" required="" type="text" value="100 req/sec"/>
<span className="material-symbols-outlined absolute right-3 top-3 text-secondary text-[20px]">speed</span>
</div>
</div>

<div className="md:col-span-2 flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="walletAddress">
<span>Receiving Monad Vault Address <span className="text-primary">*</span></span>
<span className="font-label-sm text-label-sm text-primary flex items-center gap-1 font-semibold">
<span className="w-2 h-2 rounded-full bg-primary-container"></span> Connected
              </span>
</label>
<div className="relative">
<input className="w-full bg-surface-container-high px-space-md py-3 rounded-lg font-mono font-label-md text-label-md text-on-surface cursor-not-allowed select-all" id="walletAddress" name="walletAddress" readOnly="" type="text" value="0x71C...4f9b"/>
<span className="material-symbols-outlined absolute right-3 top-3 text-tertiary text-[20px]">check_circle</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
              Escrowed funds unlock instantly to this address per block validation proof.
            </p>
</div>
</div>

<div className="p-space-md rounded-xl bg-surface-container-low flex items-center justify-between gap-space-md">
<div className="flex flex-col min-w-0">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Projected Autonomous Run-rate</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">360.00 MON <span className="font-body-sm text-body-sm font-normal text-secondary">/ day avg</span></span>
<span className="font-body-sm text-body-sm text-secondary">Assuming 60% agent capacity discovery</span>
</div>

<div className="w-32 h-10 flex-shrink-0 flex items-end gap-1">
<div className="w-3 bg-tertiary-container/30 rounded-t h-4 transition-all hover:bg-tertiary-container"></div>
<div className="w-3 bg-tertiary-container/40 rounded-t h-6 transition-all hover:bg-tertiary-container"></div>
<div className="w-3 bg-tertiary-container/60 rounded-t h-5 transition-all hover:bg-tertiary-container"></div>
<div className="w-3 bg-tertiary-container/50 rounded-t h-7 transition-all hover:bg-tertiary-container"></div>
<div className="w-3 bg-tertiary-container/80 rounded-t h-9 transition-all hover:bg-tertiary-container"></div>
<div className="w-3 bg-primary-container rounded-t h-10 animate-pulse"></div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md flex flex-col gap-space-md transition-all duration-300 hover:shadow-xl">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-primary-container"></span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Verification Preview (HTTP 402 Flow)</h3>
</div>
<button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all" id="copyBtn" onclick="copyCurlSnippet()" type="button">
<span className="material-symbols-outlined text-[16px]">content_copy</span>
<span id="copyLabel">Copy cURL</span>
</button>
</div>
<p className="font-body-sm text-body-sm text-secondary">
          Autonomous agents simulate this payload before bonding liquidity to your escrow pool.
        </p>

<div className="rounded-lg bg-inverse-surface p-space-md overflow-x-auto text-inverse-on-surface shadow-inner font-mono text-body-sm">
<div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-surface-variant/20 text-secondary">
<span className="w-2.5 h-2.5 rounded-full bg-error"></span>
<span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
<span className="ml-2 text-xs text-surface-variant font-mono">bash — test-monad-channel.sh</span>
</div>
<pre className="whitespace-pre text-xs leading-relaxed text-surface-container-low" id="curlPreview">curl -X POST "https://api.provider.network/v1/query" \
  -H "Accept: application/json" \
  -H "X-Monad-Payment-Hash: 0x8a92f0...42e1" \
  -d {'\'{"agent_id": "agent-0x94f", "task": "realtime_query"}\''}
</pre>
</div>
<div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
<span>Verified response time average: <strong className="text-on-surface">18ms</strong>. Payment receipt stored in Monad Block #18,492,012.</span>
</div>
</div>

<div className="flex flex-col gap-space-md">

<div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm">
<div className="p-2 rounded-full bg-surface-container-highest text-primary-container mt-0.5">
<span className="material-symbols-outlined text-[20px]">travel_explore</span>
</div>
<p className="font-body-sm text-body-sm text-secondary">
<strong className="font-semibold text-on-surface">Instant Network Indexing:</strong> Your endpoint will be immediately discoverable across the autonomous agent matrix. 0.05 MON initial bonding escrow will be held to prevent spam registration.
          </p>
</div>

<div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-sm">
<button className="w-full sm:w-auto px-8 py-3.5 rounded-full font-label-md text-label-md text-on-surface hover:bg-surface-container transition-all flex items-center justify-center gap-2" onclick="handleDraftSave()" type="button">
<span className="material-symbols-outlined text-[18px]">save</span>
<span>Save Draft</span>
</button>
<button className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer" type="submit">
<span>List Service in Marketplace</span>
<span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
</button>
</div>
</div>
</form>

<div className="fixed bottom-8 right-8 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none" id="toastNotification">
<div className="flex items-center gap-3 px-5 py-4 rounded-full bg-inverse-surface text-inverse-on-surface shadow-xl">
<span className="material-symbols-outlined text-tertiary-fixed text-[22px]">check_circle</span>
<span className="font-label-md text-label-md" id="toastMessage">Service Registered to Monad Marketplace!</span>
</div>
</div>
</div>
</div>
</main><footer className="w-full bg-surface-container-lowest border-t border-surface-container py-space-md px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><div className="flex items-center gap-space-md"><span className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Foundation. Autonomous Economic Layer.</span></div><div className="flex items-center gap-space-lg"><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Consensus Docs</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Security Audits</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">API RPC</Link></div></footer></div>
    </>
  );
}
