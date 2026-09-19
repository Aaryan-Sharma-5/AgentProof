
import React from 'react';
import Link from 'next/link';

export default function Marketplace() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-container"><div className="h-16 w-full px-gutter flex items-center justify-between"><div className="flex items-center gap-space-md"><img alt="AgentProof Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UtHf8oOF7fpui2t5a8XHYBUKK1hPA7aojbputIJ7-vIK70l4wn_-gVrXL6jjUbQS6dtxQqET98K1RkDy66mpa8sS5b_98Zxicc9reYuomRQTrT_LcieztTSZs2fA73tDnzsjMA3MnNzHNmYLtXFnCB1m9NvCTyxZsRwu_kGdSaoEjZdaMsvK1i5i2_R9_j5qi8U6nNbyAiPMMbRznZRpwhqzGYvkf3u-NEtY1I8APNSlGLHo-UCNipKA"/><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">AgentProof</span></div><nav className="hidden md:flex items-center gap-gutter" data-active-classes="text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1"><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="tasks" href="/dashboard">Tasks</Link><Link aria-current="page" className="transition-colors text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1" data-path="marketplace" href="/marketplace">Marketplace</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="agentflow-policy" href="#">AgentFlow Policy</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="wallet-escrow" href="#">Wallet Escrow</Link></nav><div className="flex items-center gap-space-md"><div className="hidden sm:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container"><span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span><span className="font-label-sm text-label-sm text-on-surface">Monad Devnet</span></div><div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container hover:bg-surface-container transition-colors cursor-pointer"><span className="font-label-sm text-label-sm font-semibold text-on-surface">14.50 MON</span><span className="font-body-sm text-body-sm text-secondary">|</span><span className="font-label-sm text-label-sm text-secondary font-mono">0x71C...4f9b</span></div><div className="flex items-center pl-space-xs"><img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BEV8p1SJGFqsOSr1Sw1je0DEOTYVeDQn8C8yWGoftlnGjA1ah5d9CP7nl6PSRnktAgr2XlHV6ktwSrXWKMI05feUb_PGTTJABTnE5_cTznLS6inLbnmXbQIH0mX-Wn6h0_z4Z6UnnES7jepcvx9O5Wrm59wdC_h-LTTSiMo_fmjZKhSrHWTLfZt7V5Cxgwt9h3IVEnX3_mGFEW0HwXCZHgrNmowUj0cmYaOLcO77l58anHK8i3UK"/></div></div></div></header><aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-surface-container z-40 flex flex-col justify-between py-space-lg px-space-md overflow-y-auto"><div className="flex flex-col gap-space-lg"><div className="px-space-md"><p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Economic Workspace</p></div><nav className="flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary font-semibold shadow-sm"><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="live-execution-monitor" href="/monitor"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">monitoring</span><span className="font-label-md text-label-md">Execution Monitor</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="autonomous-agents" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">smart_toy</span><span className="font-label-md text-label-md">Registered Agents</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="proof-verification" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">verified_user</span><span className="font-label-md text-label-md">Zero-Knowledge Proofs</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="liquidity-escrow-vaults" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">account_balance_wallet</span><span className="font-label-md text-label-md">Escrow Vaults</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="dispute-arbitration" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">gavel</span><span className="font-label-md text-label-md">Arbitration &amp; Slashing</span></Link></nav></div><div className="flex flex-col gap-space-md px-space-md pt-space-lg border-t border-surface-container"><div className="flex items-center justify-between"><div className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span><span className="font-label-sm text-label-sm text-secondary">Consensus Active</span></div><span className="font-label-sm text-label-sm font-mono text-on-surface-variant">v1.4.2</span></div><p className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Network</p></div></aside><div className="pl-64"><main className="w-full min-h-screen pt-16 bg-surface"><div className="flex flex-col w-full">



<div className="max-w-[1440px] w-full mx-auto px-gutter sm:px-margin py-space-lg flex flex-col gap-space-xl">

<section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
<div className="flex flex-col gap-space-xs max-w-2xl">
<div className="flex items-center gap-space-xs">
<span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            Monad Micro-Rail L1
          </span>
<span className="text-secondary font-label-sm text-label-sm">• Protocol Spec v0.9.4</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Service Marketplace</h1>
<p className="font-body-lg text-body-lg text-secondary leading-relaxed">
          Discover decentralized APIs and autonomous micro-services. Settle autonomously per-request via native <span className="text-on-surface font-semibold">HTTP 402</span> payment headers and sub-second Monad finality.
        </p>
</div>
<div className="flex items-center gap-space-md self-start md:self-auto shrink-0">
<button className="group flex items-center gap-space-xs bg-primary-container text-on-primary px-space-lg py-3 rounded-full font-label-md text-label-md shadow-sm hover:opacity-95 active:scale-98 transition-all">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
<span>List Your Service</span>
</button>
</div>
</section>

<section className="relative w-full">
<div className="bg-surface-container-lowest rounded-full shadow-md p-space-xs transition-all hover:shadow-lg">
<div className="grid grid-cols-1 lg:grid-cols-12 items-center divide-y lg:divide-y-0 lg:divide-x divide-surface-container">

<div className="lg:col-span-5 px-space-lg py-space-sm flex flex-col cursor-pointer group">
<label className="font-label-sm text-label-sm text-secondary group-hover:text-on-surface transition-colors cursor-pointer">Endpoint or Provider</label>
<div className="flex items-center gap-space-xs mt-0.5">
<span className="material-symbols-outlined text-secondary text-[20px]">search</span>
<input className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none" placeholder="Search APIs, compute, or data feeds..." type="text"/>
</div>
</div>

<div className="lg:col-span-3 px-space-lg py-space-sm flex flex-col cursor-pointer group">
<label className="font-label-sm text-label-sm text-secondary group-hover:text-on-surface transition-colors cursor-pointer">Category</label>
<div className="flex items-center justify-between mt-0.5">
<select className="w-full bg-transparent font-body-md text-body-md text-on-surface cursor-pointer focus:outline-none appearance-none pr-space-md">
<option value="all">All Ecosystems</option>
<option value="compute">High-Throughput Compute</option>
<option value="oracles">DEX &amp; CEX Feeds</option>
<option value="zk">zk-SNARK Provers</option>
<option value="proxies">Residential Crawlers</option>
</select>
<span className="material-symbols-outlined text-secondary text-[18px] pointer-events-none -ml-4">expand_more</span>
</div>
</div>

<div className="lg:col-span-4 px-space-md py-space-xs flex items-center justify-between gap-space-md">
<div className="flex flex-col pl-space-sm">
<label className="font-label-sm text-label-sm text-secondary">Max Cost (MON)</label>
<div className="flex items-center gap-space-xs mt-0.5">
<span className="font-label-md text-label-md text-primary font-mono">≤</span>
<input className="w-24 bg-transparent font-body-md text-body-md font-semibold text-on-surface focus:outline-none" type="text" value="0.05 MON"/>
</div>
</div>

<button className="bg-primary-container text-on-primary px-space-lg py-3 rounded-full flex items-center gap-space-xs font-label-md text-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all">
<span className="material-symbols-outlined text-[18px]">search</span>
<span className="hidden sm:inline">Search</span>
</button>
</div>
</div>
</div>
</section>

<section className="flex items-center gap-space-sm overflow-x-auto pb-space-xs no-scrollbar">
<button className="filter-pill shrink-0 px-space-lg py-2.5 rounded-full font-label-md text-label-md bg-on-surface text-on-primary shadow-sm transition-all hover:scale-102" onclick="switchFilter(this, 'all')">
        All Services (124)
      </button>
<button className="filter-pill shrink-0 px-space-lg py-2.5 rounded-full font-label-md text-label-md bg-surface-container-low text-secondary transition-all hover:bg-surface-container hover:text-on-surface" onclick="switchFilter(this, 'data')">
        Data APIs
      </button>
<button className="filter-pill shrink-0 px-space-lg py-2.5 rounded-full font-label-md text-label-md bg-surface-container-low text-secondary transition-all hover:bg-surface-container hover:text-on-surface" onclick="switchFilter(this, 'compute')">
        Compute &amp; Runners
      </button>
<button className="filter-pill shrink-0 px-space-lg py-2.5 rounded-full font-label-md text-label-md bg-surface-container-low text-secondary transition-all hover:bg-surface-container hover:text-on-surface" onclick="switchFilter(this, 'weather')">
        Weather &amp; Geolocation
      </button>
<button className="filter-pill shrink-0 px-space-lg py-2.5 rounded-full font-label-md text-label-md bg-surface-container-low text-secondary transition-all hover:bg-surface-container hover:text-on-surface" onclick="switchFilter(this, 'financial')">
        Financial &amp; DEX Feeds
      </button>
<button className="filter-pill shrink-0 px-space-lg py-2.5 rounded-full font-label-md text-label-md bg-surface-container-low text-secondary transition-all hover:bg-surface-container hover:text-on-surface" onclick="switchFilter(this, 'social')">
        Social Intelligence
      </button>
<button className="filter-pill shrink-0 px-space-lg py-2.5 rounded-full font-label-md text-label-md bg-surface-container-low text-secondary transition-all hover:bg-surface-container hover:text-on-surface" onclick="switchFilter(this, 'zk')">
        Verified zk-Endpoints
      </button>
</section>

<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">

<article className="group bg-surface-container-lowest rounded-[16px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

<div className="relative h-48 w-full bg-gradient-to-tr from-secondary-container via-surface-container to-surface-variant overflow-hidden flex items-center justify-center p-space-lg">
<div className="absolute inset-0 opacity-15 bg-[radial-gradient(#b52330_1px,transparent_1px)] [background-size:16px_16px]"></div>

<svg className="w-28 h-28 text-on-surface-variant group-hover:scale-105 transition-transform duration-300" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">





</svg>
<span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-1 rounded-full font-label-sm text-label-sm text-on-surface font-semibold shadow-sm flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Proxy Mesh
          </span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 shadow-sm">
<span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span> 4.98
          </span>
</div>

<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary font-mono">0x34A...88bc</span>
<span className="font-label-sm text-label-sm text-tertiary font-semibold">99.98% Uptime</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors">
              WebScrapePro Residential Proxy API
            </h2>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
              Dynamic headless Puppeteer cluster with automated HTTP 402 gas escrow.
            </p>
</div>

<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-baseline justify-between">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">0.003 MON <span className="font-body-sm text-body-sm text-secondary font-normal">/ req</span></span>
<span className="font-label-sm text-label-sm text-secondary">1,420 calls today</span>
</div>
<div className="flex items-center gap-1.5 text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
<span className="font-body-sm text-body-sm">HTTP 402 Monad-settled</span>
</div>
</div>

<div className="flex items-center gap-space-sm pt-space-sm">
<button className="flex-1 py-2 rounded-full bg-on-surface text-on-primary font-label-md text-label-md text-center hover:opacity-90 transition-all">
              View Endpoint
            </button>
<button className="px-space-md py-2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors flex items-center gap-1" onclick="toggleTestPing(event, 'card-1')">
<span className="material-symbols-outlined text-[16px]">bolt</span>
<span>Test Ping</span>
</button>
</div>
</div>
</article>

<article className="group bg-surface-container-lowest rounded-[16px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

<div className="relative h-48 w-full bg-gradient-to-br from-tertiary via-on-tertiary-container to-surface-variant overflow-hidden flex items-center justify-center p-space-lg">
<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#91f2f7_1px,transparent_1px)] [background-size:14px_14px]"></div>

<svg className="w-28 h-28 group-hover:scale-105 transition-transform duration-300" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">





</svg>
<span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-1 rounded-full font-label-sm text-label-sm text-on-surface font-semibold shadow-sm flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Satellite IoT
          </span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 shadow-sm">
<span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span> 4.95
          </span>
</div>

<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">OpenAtmo Labs</span>
<span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">verified</span> Verified Provider
              </span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors">
              Hyperlocal Weather &amp; Satellite Radar
            </h2>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
              NOAA and ECMWF raw telemetry aggregated every 3 seconds for agricultural agents.
            </p>
</div>

<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-baseline justify-between">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">0.001 MON <span className="font-body-sm text-body-sm text-secondary font-normal">/ req</span></span>
<span className="font-label-sm text-label-sm text-secondary">8,900 calls</span>
</div>
<div className="flex items-center gap-1.5 text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
<span className="font-body-sm text-body-sm">Sub-second Latency SLA</span>
</div>
</div>

<div className="flex items-center gap-space-sm pt-space-sm">
<button className="w-full py-2 rounded-full bg-on-surface text-on-primary font-label-md text-label-md text-center hover:opacity-90 transition-all">
              View Endpoint
            </button>
</div>
</div>
</article>

<article className="group bg-surface-container-lowest rounded-[16px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

<div className="relative h-48 w-full bg-gradient-to-tr from-on-primary-container via-primary to-primary-fixed overflow-hidden flex items-center justify-center p-space-lg">
<div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"></div>

<svg className="w-28 h-28 group-hover:scale-105 transition-transform duration-300" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">





</svg>
<span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-1 rounded-full font-label-sm text-label-sm text-on-surface font-semibold shadow-sm flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span> Dedicated GPU Pod
          </span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 shadow-sm">
<span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span> 5.0
          </span>
</div>

<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">ComputeNodes DAO</span>
<span className="font-label-sm text-label-sm text-primary font-semibold">8x H100 SXM5</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors">
              DeepSeek R1 High-Throughput Reasoning
            </h2>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
              Full chain-of-thought model weights streaming responses directly via state channels.
            </p>
</div>

<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-baseline justify-between">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">0.008 MON <span className="font-body-sm text-body-sm text-secondary font-normal">/ req</span></span>
<span className="font-label-sm text-label-sm text-secondary">34,100 calls</span>
</div>
<div className="flex items-center gap-1.5 text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
<span className="font-body-sm text-body-sm">Zero-knowledge prompt masking</span>
</div>
</div>

<div className="flex items-center gap-space-sm pt-space-sm">
<button className="w-full py-2 rounded-full bg-on-surface text-on-primary font-label-md text-label-md text-center hover:opacity-90 transition-all">
              View Endpoint
            </button>
</div>
</div>
</article>

<article className="group bg-surface-container-lowest rounded-[16px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

<div className="relative h-48 w-full bg-gradient-to-tr from-on-tertiary-container via-tertiary to-tertiary-fixed overflow-hidden flex items-center justify-center p-space-lg">
<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:14px_14px]"></div>

<svg className="w-28 h-28 group-hover:scale-105 transition-transform duration-300" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">







</svg>
<span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-1 rounded-full font-label-sm text-label-sm text-on-surface font-semibold shadow-sm flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span> 10ms Tick Feed
          </span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 shadow-sm">
<span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span> 4.99
          </span>
</div>

<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">Pyth / MonadFeed</span>
<span className="font-label-sm text-label-sm text-tertiary font-semibold">10,000 TPS Ready</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors">
              Monad High-Frequency DEX Price Oracle
            </h2>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
              Sub-slot pricing across Uniswap v4, Curvance, and Ambient orderbooks on Monad.
            </p>
</div>

<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-baseline justify-between">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">0.0005 MON <span className="font-body-sm text-body-sm text-secondary font-normal">/ req</span></span>
<span className="font-label-sm text-label-sm text-secondary">120,400 calls</span>
</div>
<div className="flex items-center gap-1.5 text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span className="font-body-sm text-body-sm">Cryptographic multi-sig signed payload</span>
</div>
</div>

<div className="flex items-center gap-space-sm pt-space-sm">
<button className="w-full py-2 rounded-full bg-on-surface text-on-primary font-label-md text-label-md text-center hover:opacity-90 transition-all">
              View Endpoint
            </button>
</div>
</div>
</article>

<article className="group bg-surface-container-lowest rounded-[16px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

<div className="relative h-48 w-full bg-gradient-to-br from-surface-variant via-secondary-container to-primary-fixed-dim overflow-hidden flex items-center justify-center p-space-lg">
<div className="absolute inset-0 opacity-15 bg-[radial-gradient(#b52330_1px,transparent_1px)] [background-size:12px_12px]"></div>

<svg className="w-28 h-28 group-hover:scale-105 transition-transform duration-300" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">




</svg>
<span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-1 rounded-full font-label-sm text-label-sm text-on-surface font-semibold shadow-sm flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span> NLP Stream
          </span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 shadow-sm">
<span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span> 4.88
          </span>
</div>

<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">PulseAlpha Node</span>
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Live Firehose</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors">
              X &amp; Telegram Sentiment Firehose
            </h2>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
              Structured JSON sentiment, entity mentions, and KOL velocity metrics refreshed every block.
            </p>
</div>

<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-baseline justify-between">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">0.004 MON <span className="font-body-sm text-body-sm text-secondary font-normal">/ req</span></span>
<span className="font-label-sm text-label-sm text-secondary">3,200 calls</span>
</div>
<div className="flex items-center gap-1.5 text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span className="font-body-sm text-body-sm">Pre-scored Bull/Bear vectors</span>
</div>
</div>

<div className="flex items-center gap-space-sm pt-space-sm">
<button className="w-full py-2 rounded-full bg-on-surface text-on-primary font-label-md text-label-md text-center hover:opacity-90 transition-all">
              View Endpoint
            </button>
</div>
</div>
</article>

<article className="group bg-surface-container-lowest rounded-[16px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

<div className="relative h-48 w-full bg-gradient-to-tr from-on-tertiary-fixed-variant via-tertiary to-secondary-container overflow-hidden flex items-center justify-center p-space-lg">
<div className="absolute inset-0 opacity-20 bg-[radial-gradient(#91f2f7_1px,transparent_1px)] [background-size:16px_16px]"></div>

<svg className="w-28 h-28 group-hover:scale-105 transition-transform duration-300" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">






</svg>
<span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-1 rounded-full font-label-sm text-label-sm text-on-surface font-semibold shadow-sm flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Groth16 / Halo2
          </span>
<span className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 shadow-sm">
<span className="material-symbols-outlined text-[14px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span> 4.97
          </span>
</div>

<div className="p-space-lg flex flex-col flex-1 justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-body-sm text-body-sm text-secondary">SuccinctZK Labs</span>
<span className="font-label-sm text-label-sm text-tertiary font-semibold">On-chain Verifiable</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-primary transition-colors">
              zkSNARK Proof Generator for SQL Queries
            </h2>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
              Prove integrity of relational computations over BigQuery and PostgreSQL datasets without leakage.
            </p>
</div>

<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-baseline justify-between">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">0.015 MON <span className="font-body-sm text-body-sm text-secondary font-normal">/ req</span></span>
<span className="font-label-sm text-label-sm text-secondary">940 proofs</span>
</div>
<div className="flex items-center gap-1.5 text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
<span className="font-body-sm text-body-sm">Monad EVM contract proof-check: 21k gas</span>
</div>
</div>

<div className="flex items-center gap-space-sm pt-space-sm">
<button className="w-full py-2 rounded-full bg-on-surface text-on-primary font-label-md text-label-md text-center hover:opacity-90 transition-all">
              View Endpoint
            </button>
</div>
</div>
</article>
</section>

<section className="bg-surface-container-low rounded-xl p-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-md mb-space-lg">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
<span className="material-symbols-outlined text-[24px]">receipt_long</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Instant HTTP 402 Settlement</span>
<span className="font-body-sm text-body-sm text-secondary">Every single API invocation streams direct payments without API keys or card deposits.</span>
</div>
</div>
<div className="flex items-center gap-gutter shrink-0">
<div className="flex flex-col items-end">
<span className="font-label-sm text-label-sm text-secondary">Daily Settled Volume</span>
<span className="font-headline-sm text-headline-sm font-bold text-on-surface font-mono">1,842.60 MON</span>
</div>
<div className="h-8 w-px bg-surface-container"></div>
<div className="flex flex-col items-end">
<span className="font-label-sm text-label-sm text-secondary">Median Settlement</span>
<span className="font-headline-sm text-headline-sm font-bold text-tertiary font-mono">24ms</span>
</div>
</div>
</section>
</div>
</div></main><footer className="w-full bg-surface-container-lowest border-t border-surface-container py-space-md px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><div className="flex items-center gap-space-md"><span className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Foundation. Autonomous Economic Layer.</span></div><div className="flex items-center gap-space-lg"><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Consensus Docs</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Security Audits</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">API RPC</Link></div></footer></div>
    </>
  );
}
