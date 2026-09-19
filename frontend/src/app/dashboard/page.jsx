
import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-container"><div className="h-16 w-full px-gutter flex items-center justify-between"><div className="flex items-center gap-space-md"><img alt="AgentProof Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UtHf8oOF7fpui2t5a8XHYBUKK1hPA7aojbputIJ7-vIK70l4wn_-gVrXL6jjUbQS6dtxQqET98K1RkDy66mpa8sS5b_98Zxicc9reYuomRQTrT_LcieztTSZs2fA73tDnzsjMA3MnNzHNmYLtXFnCB1m9NvCTyxZsRwu_kGdSaoEjZdaMsvK1i5i2_R9_j5qi8U6nNbyAiPMMbRznZRpwhqzGYvkf3u-NEtY1I8APNSlGLHo-UCNipKA"/><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">AgentProof</span></div><nav className="hidden md:flex items-center gap-gutter" data-active-classes="text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1"><Link aria-current="page" className="transition-colors text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1" data-path="tasks" href="/dashboard">Tasks</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="marketplace" href="/marketplace">Marketplace</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="agentflow-policy" href="#">AgentFlow Policy</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="wallet-escrow" href="#">Wallet Escrow</Link></nav><div className="flex items-center gap-space-md"><div className="hidden sm:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container"><span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span><span className="font-label-sm text-label-sm text-on-surface">Monad Devnet</span></div><div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container hover:bg-surface-container transition-colors cursor-pointer"><span className="font-label-sm text-label-sm font-semibold text-on-surface">14.50 MON</span><span className="font-body-sm text-body-sm text-secondary">|</span><span className="font-label-sm text-label-sm text-secondary font-mono">0x71C...4f9b</span></div><div className="flex items-center pl-space-xs"><img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BEV8p1SJGFqsOSr1Sw1je0DEOTYVeDQn8C8yWGoftlnGjA1ah5d9CP7nl6PSRnktAgr2XlHV6ktwSrXWKMI05feUb_PGTTJABTnE5_cTznLS6inLbnmXbQIH0mX-Wn6h0_z4Z6UnnES7jepcvx9O5Wrm59wdC_h-LTTSiMo_fmjZKhSrHWTLfZt7V5Cxgwt9h3IVEnX3_mGFEW0HwXCZHgrNmowUj0cmYaOLcO77l58anHK8i3UK"/></div></div></div></header><aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-surface-container z-40 flex flex-col justify-between py-space-lg px-space-md overflow-y-auto"><div className="flex flex-col gap-space-lg"><div className="px-space-md"><p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Economic Workspace</p></div><nav className="flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary font-semibold shadow-sm"><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="live-execution-monitor" href="/monitor"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">monitoring</span><span className="font-label-md text-label-md">Execution Monitor</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="autonomous-agents" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">smart_toy</span><span className="font-label-md text-label-md">Registered Agents</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="proof-verification" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">verified_user</span><span className="font-label-md text-label-md">Zero-Knowledge Proofs</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="liquidity-escrow-vaults" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">account_balance_wallet</span><span className="font-label-md text-label-md">Escrow Vaults</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="dispute-arbitration" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">gavel</span><span className="font-label-md text-label-md">Arbitration &amp; Slashing</span></Link></nav></div><div className="flex flex-col gap-space-md px-space-md pt-space-lg border-t border-surface-container"><div className="flex items-center justify-between"><div className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span><span className="font-label-sm text-label-sm text-secondary">Consensus Active</span></div><span className="font-label-sm text-label-sm font-mono text-on-surface-variant">v1.4.2</span></div><p className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Network</p></div></aside><div className="pl-64"><main className="w-full min-h-screen pt-16 bg-surface"><div className="flex flex-col w-full">
<div className="px-gutter py-space-xl max-w-[1440px] mx-auto w-full flex flex-col gap-space-xl">

<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Autonomous Task Management</span>
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
<span className="font-label-sm text-label-sm text-tertiary font-semibold">Zero-Knowledge Escrow Active</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Your Tasks</h1>
</div>

<div className="flex items-center gap-space-md flex-wrap sm:flex-nowrap">
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-space-md text-secondary text-[20px]">search</span>
<input className="pl-10 pr-space-md py-2.5 bg-surface-container-lowest rounded-full font-body-sm text-body-sm text-on-surface shadow-sm focus:outline-none focus:bg-surface-container-lowest transition-all w-64 md:w-72" placeholder="Search task, hash or agent ID..." type="text"/>
</div>
<Link href="/create-task" className="flex items-center gap-space-xs px-space-lg py-3 bg-primary-container text-on-primary rounded-full font-label-md text-label-md hover:bg-primary transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap">
<span className="material-symbols-outlined text-[18px]">add</span>
<span>Create New Task</span>
</Link>
</div>
</div>

<div className="flex items-center justify-between gap-space-md overflow-x-auto pb-space-xs">
<div className="flex items-center gap-space-sm p-1.5 bg-surface-container-low rounded-full shadow-inner min-w-max">
<button className="px-space-md py-2 rounded-full font-label-md text-label-md bg-surface-container-lowest text-on-surface shadow-sm font-semibold transition-all">
          All Tasks (12)
        </button>
<button className="flex items-center gap-space-xs px-space-md py-2 rounded-full font-label-md text-label-md text-secondary hover:text-on-surface hover:bg-surface-container transition-all">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
<span>Agent Working (4)</span>
</button>
<button className="px-space-md py-2 rounded-full font-label-md text-label-md text-secondary hover:text-on-surface hover:bg-surface-container transition-all">
          Completed (7)
        </button>
<button className="flex items-center gap-space-xs px-space-md py-2 rounded-full font-label-md text-label-md text-secondary hover:text-on-surface hover:bg-surface-container transition-all">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span>Action Required (1)</span>
</button>
</div>
<div className="hidden xl:flex items-center gap-space-xs text-secondary font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[18px]">tune</span>
<span>Filter &amp; Sorters</span>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Active Escrow Locked</span>
<div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
<span className="material-symbols-outlined text-[18px]">lock_clock</span>
</div>
</div>
<div className="flex flex-col">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-md text-headline-md font-bold text-on-surface">2.84</span>
<span className="font-label-md text-label-md text-secondary">MON</span>
</div>
<span className="font-body-sm text-body-sm text-tertiary flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">shield</span> Protected by Timelock
          </span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Tasks in Progress</span>
<div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
<span className="material-symbols-outlined text-[18px]">smart_toy</span>
</div>
</div>
<div className="flex flex-col">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-md text-headline-md font-bold text-on-surface">4</span>
<span className="font-label-md text-label-md text-secondary">Autonomous Agents</span>
</div>
<span className="font-body-sm text-body-sm text-secondary mt-1">Parallel execution threads</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Spend Approved This Week</span>
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined text-[18px]">payments</span>
</div>
</div>
<div className="flex flex-col">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-md text-headline-md font-bold text-on-surface">0.82</span>
<span className="font-label-md text-label-md text-secondary">MON</span>
</div>
<span className="font-body-sm text-body-sm text-secondary mt-1">Under dynamic rate ceiling</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Proof Verification Rate</span>
<div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary">
<span className="material-symbols-outlined text-[18px]">verified</span>
</div>
</div>
<div className="flex flex-col">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-md text-headline-md font-bold text-tertiary">99.4%</span>
<span className="font-label-md text-label-md text-secondary">Consensus</span>
</div>
<span className="font-body-sm text-body-sm text-tertiary flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">bolt</span> zk-SNARK Instant Finality
          </span>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">

<div className="group bg-surface-container-lowest rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">

<div className="relative h-44 w-full bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Abstract algorithmic graph network showing real-time market data scrapers and crawler nodes against a clean warm architectural backdrop with soft coral light reflections" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeSnE7GgnHdSQtedCMgvKVWoghdyGrO_yI-I6hnqinHoLjZJZumP-5duM5KOG_LqCHXCRMSsu8vXm6VN9Wy74PV6GbbuRXKa8PpYIBiYEMlqmOnJR8oQ4Lm-90GFO2zFBsfCEA_erhHbt3pVEHBNPbEVnY3VMTmjztABxMZdjX8N7ZTcC6HUwHO-65sWsju4tGm_JGLaSte0pLGKTzmeMz6hS1x400RC3A8YHIIxHRMljF-fBRhAhg"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
<div className="absolute top-space-md left-space-md">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-tertiary font-label-sm text-label-sm shadow-sm">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
              Agent Working
            </span>
</div>
<div className="absolute top-space-md right-space-md">
<span className="px-2.5 py-1 rounded-full bg-on-surface/80 backdrop-blur-sm text-surface font-label-sm text-label-sm font-mono">
              0x4e...a71
            </span>
</div>
<div className="absolute bottom-space-md left-space-md right-space-md">
<span className="text-surface font-label-sm text-label-sm uppercase tracking-wider opacity-90">Market Intelligence</span>
<h2 className="text-surface font-headline-sm text-headline-sm font-semibold truncate">Competitor Pricing Research &amp; Scraping</h2>
</div>
</div>

<div className="p-space-lg flex flex-col gap-space-md flex-1 justify-between">
<div className="flex flex-col gap-space-sm">

<div className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg font-label-sm text-label-sm text-secondary">
<div>Reward: <span className="font-bold text-on-surface">0.05 MON</span></div>
<span className="text-surface-variant">|</span>
<div>Limit: <span className="font-bold text-on-surface">0.02 MON</span></div>
</div>

<div className="flex flex-col gap-1.5 pt-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-secondary">Progress: Step 3 of 5</span>
<span className="font-bold text-on-surface">60%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{width: '60%'}}></div>
</div>
</div>

<div className="flex flex-col gap-1 text-body-sm font-body-sm text-secondary mt-1">
<p className="truncate"><span className="font-semibold text-on-surface">Target:</span> Top 5 SaaS tools</p>
<div className="flex items-center justify-between text-secondary">
<span>Spent so far: <span className="font-mono text-on-surface font-semibold">0.008 MON</span></span>
</div>
<p className="text-label-sm font-mono text-tertiary truncate flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">receipt_long</span> HTTP 402 Paid to WebScrape API
              </p>
</div>
</div>

<div className="pt-space-md">
<button className="w-full py-2.5 px-space-md bg-surface-container text-on-surface hover:bg-surface-container-high rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs cursor-pointer">
<span>Inspect Execution</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">

<div className="relative h-44 w-full bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Futuristic high-frequency algorithmic liquidity pool visualization with glowing node connectors and Monad blockchain gas routes against an architectural cream studio background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3DRr1l0R1Rw5_V2ni9lBdEoP_g7DoRRzoVJ3743DS0SXsu_vlp3PM4ATEyNVwvJuHzaebe2XPeh5YiJQohPRpN4_TljoHM5aEq-a2JWsmcM7SvyHiZ0bqwgXMyrEqNfmgoANI97rDqXrQvoXM_EZbleXCeq2z3_lw2HyTTP_BayhKSaHd4JtSgAx3Mr4wo7LBslBFVVf1Iox6viQa669Pz4wLUfyE24cLxXlWsEdXo2JuObjYJLnP"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
<div className="absolute top-space-md left-space-md">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-tertiary font-label-sm text-label-sm shadow-sm">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
              Agent Working
            </span>
</div>
<div className="absolute top-space-md right-space-md">
<span className="px-2.5 py-1 rounded-full bg-on-surface/80 backdrop-blur-sm text-surface font-label-sm text-label-sm font-mono">
              0x19...c32
            </span>
</div>
<div className="absolute bottom-space-md left-space-md right-space-md">
<span className="text-surface font-label-sm text-label-sm uppercase tracking-wider opacity-90">DeFi Automation</span>
<h2 className="text-surface font-headline-sm text-headline-sm font-semibold truncate">Arbitrage Opportunity Scanner on Monad DEXs</h2>
</div>
</div>

<div className="p-space-lg flex flex-col gap-space-md flex-1 justify-between">
<div className="flex flex-col gap-space-sm">

<div className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg font-label-sm text-label-sm text-secondary">
<div>Reward: <span className="font-bold text-on-surface">0.12 MON</span></div>
<span className="text-surface-variant">|</span>
<div>Limit: <span className="font-bold text-on-surface">0.05 MON</span></div>
</div>

<div className="flex flex-col gap-1.5 pt-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-secondary">Progress: Step 4 of 5</span>
<span className="font-bold text-on-surface">80%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{width: '80%'}}></div>
</div>
</div>

<div className="flex flex-col gap-1 text-body-sm font-body-sm text-secondary mt-1">
<p className="truncate"><span className="font-semibold text-on-surface">Status:</span> Routing across 6 decentralized AMMs</p>
<div className="flex items-center justify-between text-secondary">
<span>14 API calls executed</span>
<span className="font-mono text-on-surface font-semibold">0.031 MON spent</span>
</div>
<p className="text-label-sm font-mono text-tertiary truncate flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">sync_alt</span> Swap path simulation successful
              </p>
</div>
</div>

<div className="pt-space-md">
<button className="w-full py-2.5 px-space-md bg-surface-container text-on-surface hover:bg-surface-container-high rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs cursor-pointer">
<span>Inspect Execution</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">

<div className="relative h-44 w-full bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Conceptual cryptographic smart contract security audit visualization featuring pristine glowing geometry blocks, verification seals and clean warm aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIezEWGDu2Nu6F7GuVpV7Vd7onSutyswI6elX0cDADNKl5AWswJDb9J8vD8haEIoRWZnPIVviRMvBFGK2IRtHETjEwHb1KZ8_wsr15JXzyujZZ93CCrRnRPWIkIuiPJb86fsIA4QTKfFMNuiJb2vjtG2NnWFBlrNoelR8SJoHus32wXDYwBWCYlnPmbCPrV4FdLUQEokhA_vrLX7UKWiUThD9Uz9-ZemuuAZhhB6lS5q1_XR9A2q0I"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
<div className="absolute top-space-md left-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-sm text-tertiary font-label-sm text-label-sm shadow-sm">
<span className="material-symbols-outlined text-[14px]">verified</span>
              Completed
            </span>
</div>
<div className="absolute top-space-md right-space-md">
<span className="px-2.5 py-1 rounded-full bg-on-surface/80 backdrop-blur-sm text-surface font-label-sm text-label-sm font-mono">
              0x82...91f
            </span>
</div>
<div className="absolute bottom-space-md left-space-md right-space-md">
<span className="text-surface font-label-sm text-label-sm uppercase tracking-wider opacity-90">Security Protocol</span>
<h2 className="text-surface font-headline-sm text-headline-sm font-semibold truncate">Automated Solidity Contract Audit &amp; Fuzzing</h2>
</div>
</div>

<div className="p-space-lg flex flex-col gap-space-md flex-1 justify-between">
<div className="flex flex-col gap-space-sm">

<div className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg font-label-sm text-label-sm text-secondary">
<div>Reward: <span className="font-bold text-on-surface">0.40 MON</span></div>
<span className="text-surface-variant">|</span>
<div>Limit: <span className="font-bold text-on-surface">0.10 MON</span></div>
</div>

<div className="flex flex-col gap-1.5 pt-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-secondary">Progress: Complete</span>
<span className="font-bold text-tertiary">100%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-tertiary-container rounded-full" style={{width: '100%'}}></div>
</div>
</div>

<div className="flex flex-col gap-1 text-body-sm font-body-sm text-secondary mt-1">
<p className="truncate"><span className="font-semibold text-on-surface">Report:</span> Zero high-severity vulnerabilities</p>
<div className="flex items-center justify-between text-secondary">
<span>Settled to Agent:</span>
<span className="font-mono text-on-surface font-semibold">0x82a...91f</span>
</div>
<p className="text-label-sm font-mono text-tertiary truncate flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">check_circle</span> Escrow disbursed via zk-Proof verification
              </p>
</div>
</div>

<div className="pt-space-md">
<button className="w-full py-2.5 px-space-md bg-surface-container text-on-surface hover:bg-surface-container-high rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs cursor-pointer">
<span>View Audit Receipt</span>
<span className="material-symbols-outlined text-[16px]">description</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">

<div className="relative h-44 w-full bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Stylized glowing social media waveforms and semantic analysis node graphs rendered with clean warm light accents and subtle gradient textures" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkHRX1W8AhU-dVfayhaadDpIdfLdjpbvuVhAL6BNRmHgm4Maa48qJ_fZO-1okXwMoNNT-BjWZWmRGs1ZkivuqrHoF41HD0kFdAQm0xeN-uGo9r9pKv0gmTJM2N6gvuNorRzQXd8B7JHfwRlWUcy34qgbtBFdZq6wox_BuA5WJZeItUjHD31z7-lAFTa7KiEMUs4pldH5KV97H_-kVmY5OOq0dqKHcMt_UhDXoPU_RNBJRLR0AzJOR8"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
<div className="absolute top-space-md left-space-md">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-tertiary font-label-sm text-label-sm shadow-sm">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
              Agent Working
            </span>
</div>
<div className="absolute top-space-md right-space-md">
<span className="px-2.5 py-1 rounded-full bg-on-surface/80 backdrop-blur-sm text-surface font-label-sm text-label-sm font-mono">
              0xfa...702
            </span>
</div>
<div className="absolute bottom-space-md left-space-md right-space-md">
<span className="text-surface font-label-sm text-label-sm uppercase tracking-wider opacity-90">Social Intelligence</span>
<h2 className="text-surface font-headline-sm text-headline-sm font-semibold truncate">Real-time Crypto Sentiment &amp; Social Signals</h2>
</div>
</div>

<div className="p-space-lg flex flex-col gap-space-md flex-1 justify-between">
<div className="flex flex-col gap-space-sm">

<div className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg font-label-sm text-label-sm text-secondary">
<div>Reward: <span className="font-bold text-on-surface">0.08 MON</span></div>
<span className="text-surface-variant">|</span>
<div>Limit: <span className="font-bold text-on-surface">0.03 MON</span></div>
</div>

<div className="flex flex-col gap-1.5 pt-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-secondary">Progress: Step 2 of 5</span>
<span className="font-bold text-on-surface">40%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full" style={{width: '40%'}}></div>
</div>
</div>

<div className="flex flex-col gap-1 text-body-sm font-body-sm text-secondary mt-1">
<p className="truncate"><span className="font-semibold text-on-surface">Scope:</span> Parsing 40,000 Telegram/X mentions</p>
<div className="flex items-center justify-between text-secondary">
<span>Consumed Gas &amp; Fees:</span>
<span className="font-mono text-on-surface font-semibold">0.009 MON</span>
</div>
<p className="text-label-sm font-mono text-tertiary truncate flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">psychology</span> Fine-tuning BERT sentiment pipeline
              </p>
</div>
</div>

<div className="pt-space-md">
<button className="w-full py-2.5 px-space-md bg-surface-container text-on-surface hover:bg-surface-container-high rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs cursor-pointer">
<span>Inspect Execution</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">

<div className="relative h-44 w-full bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Clean architectural still life with stacked illuminated glass document sheets and warm coral daylight symbolizing academic research synthesis" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE_P3aC7Cl-OFP5Enx-H8vF_3BDtDHkFKTdAUgPFnNE7SZTkQhhX0nIlaJhYSRmmMSqQz4jUdp5LEA0cSSu0gGmRvft40_ZPZ3nRnMIc_uEJMXKyHu_P1OlkPqiXznOLk9Z53jR2_IhqT0qcDY1KmEccU7yxGmXoNZqIgcMFnrRv0R2pIhaRYyurWjuofkDvIFsZY5S3i8nQZa4kJJRsM-XQGEDbhlu7UMR-6z7TRjJeI7ZaT1vhvq"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
<div className="absolute top-space-md left-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur-sm text-tertiary font-label-sm text-label-sm shadow-sm">
<span className="material-symbols-outlined text-[14px]">verified</span>
              Completed
            </span>
</div>
<div className="absolute top-space-md right-space-md">
<span className="px-2.5 py-1 rounded-full bg-on-surface/80 backdrop-blur-sm text-surface font-label-sm text-label-sm font-mono">
              0x3b...66a
            </span>
</div>
<div className="absolute bottom-space-md left-space-md right-space-md">
<span className="text-surface font-label-sm text-label-sm uppercase tracking-wider opacity-90">Academic Research</span>
<h2 className="text-surface font-headline-sm text-headline-sm font-semibold truncate">Synthesizing AI Research Whitepapers</h2>
</div>
</div>

<div className="p-space-lg flex flex-col gap-space-md flex-1 justify-between">
<div className="flex flex-col gap-space-sm">

<div className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg font-label-sm text-label-sm text-secondary">
<div>Reward: <span className="font-bold text-on-surface">0.06 MON</span></div>
<span className="text-surface-variant">|</span>
<div>Limit: <span className="font-bold text-on-surface">0.02 MON</span></div>
</div>

<div className="flex flex-col gap-1.5 pt-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-secondary">Progress: Complete</span>
<span className="font-bold text-tertiary">100%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-tertiary-container rounded-full" style={{width: '100%'}}></div>
</div>
</div>

<div className="flex flex-col gap-1 text-body-sm font-body-sm text-secondary mt-1">
<p className="truncate"><span className="font-semibold text-on-surface">Output:</span> 12-page comprehensive meta-analysis</p>
<div className="flex items-center justify-between text-secondary">
<span>Storage Hash:</span>
<span className="font-mono text-on-surface font-semibold truncate max-w-[120px]">ipfs://Qm78...4b</span>
</div>
<p className="text-label-sm font-mono text-tertiary truncate flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">task_alt</span> Proof validated on Monad Consensus
              </p>
</div>
</div>

<div className="pt-space-md">
<button className="w-full py-2.5 px-space-md bg-surface-container text-on-surface hover:bg-surface-container-high rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs cursor-pointer">
<span>Read Synthesized PDF</span>
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
</button>
</div>
</div>
</div>

<div className="group bg-surface-container-lowest rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">

<div className="relative h-44 w-full bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale opacity-80" data-alt="Atmospheric radar flight telemetry simulation with storm fronts and flight vector trails in subtle earthy clay and amber minimal styling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg5j__xwpnlGsdoZs8b4mPodbrYkOUtKi921e2f5cXYlsm1gVY6FG09Pxz4Bm91WWJq6FA9IhivYh7Po7B4RHiVo0N9U8PDm8YPByOpxHaIX1emeYEJE8Qvu_GZ0Sh93O_Z_rSbgMCPHM0lnxrkkRD1lVSOLKSrZYX-MhHzrjifMJYOHDVCAUemUqGEFhnXiySTKcat2iTTO12GCUZvc9lFtLJomAnIL4YTqO9tiwu6pNxIIr5ELoG"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
<div className="absolute top-space-md left-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-fixed/90 backdrop-blur-sm text-on-secondary-fixed font-label-sm text-label-sm shadow-sm">
<span className="material-symbols-outlined text-[14px] text-error">replay</span>
              Escrow Refunded
            </span>
</div>
<div className="absolute top-space-md right-space-md">
<span className="px-2.5 py-1 rounded-full bg-on-surface/80 backdrop-blur-sm text-surface font-label-sm text-label-sm font-mono">
              0x0d...55c
            </span>
</div>
<div className="absolute bottom-space-md left-space-md right-space-md">
<span className="text-surface font-label-sm text-label-sm uppercase tracking-wider opacity-90">Predictive Analytics</span>
<h2 className="text-surface font-headline-sm text-headline-sm font-semibold truncate">Weather &amp; Flight Delay Correlation Modeling</h2>
</div>
</div>

<div className="p-space-lg flex flex-col gap-space-md flex-1 justify-between">
<div className="flex flex-col gap-space-sm">

<div className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg font-label-sm text-label-sm text-secondary">
<div>Reward: <span className="font-bold text-on-surface">0.03 MON</span></div>
<span className="text-surface-variant">|</span>
<div>Refunded: <span className="font-bold text-on-surface">0.03 MON</span></div>
</div>

<div className="flex flex-col gap-1.5 pt-1">
<div className="flex items-center justify-between text-body-sm font-body-sm">
<span className="text-secondary">Status: Timeout Slashing Triggered</span>
<span className="font-bold text-error">Terminated</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary rounded-full" style={{width: '100%'}}></div>
</div>
</div>

<div className="flex flex-col gap-1 text-body-sm font-body-sm text-secondary mt-1">
<p className="truncate"><span className="font-semibold text-on-surface">Reason:</span> External NOAA API deadlocked</p>
<div className="flex items-center justify-between text-secondary">
<span>Policy Resolution:</span>
<span className="font-mono text-on-surface font-semibold">100% Repatriated</span>
</div>
<p className="text-label-sm font-mono text-error truncate flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-[14px]">history</span> Smart contract returned escrow to wallet
              </p>
</div>
</div>

<div className="pt-space-md">
<button className="w-full py-2.5 px-space-md bg-surface-container text-on-surface hover:bg-surface-container-high rounded-full font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs cursor-pointer">
<span>View Slashing Log</span>
<span className="material-symbols-outlined text-[16px]">gavel</span>
</button>
</div>
</div>
</div>
</div>

<div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[24px]">terminal</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="font-label-md text-label-md font-bold text-on-surface">Live AgentFlow Daemon</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-mono">PID 99824</span>
</div>
<p className="font-body-sm text-body-sm text-secondary">Subscribed to 4 WebSocket agent execution pipelines via Monad Devnet Gateway.</p>
</div>
</div>
<div className="flex items-center gap-space-sm w-full md:w-auto">
<button className="flex-1 md:flex-none px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer">
          Stream Raw JSON-RPC
        </button>
<button className="flex-1 md:flex-none px-space-md py-2 rounded-full bg-on-surface text-surface hover:bg-on-surface/90 font-label-sm text-label-sm transition-colors cursor-pointer">
          Download Telemetry
        </button>
</div>
</div>
</div>
</div>
</main><footer className="w-full bg-surface-container-lowest border-t border-surface-container py-space-md px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><div className="flex items-center gap-space-md"><span className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Foundation. Autonomous Economic Layer.</span></div><div className="flex items-center gap-space-lg"><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Consensus Docs</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Security Audits</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">API RPC</Link></div></footer></div>
    </>
  );
}
