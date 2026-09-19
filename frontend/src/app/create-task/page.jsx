
import React from 'react';
import Link from 'next/link';

export default function CreateTask() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-container"><div className="h-16 w-full px-gutter flex items-center justify-between"><div className="flex items-center gap-space-md"><img alt="AgentProof Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UtHf8oOF7fpui2t5a8XHYBUKK1hPA7aojbputIJ7-vIK70l4wn_-gVrXL6jjUbQS6dtxQqET98K1RkDy66mpa8sS5b_98Zxicc9reYuomRQTrT_LcieztTSZs2fA73tDnzsjMA3MnNzHNmYLtXFnCB1m9NvCTyxZsRwu_kGdSaoEjZdaMsvK1i5i2_R9_j5qi8U6nNbyAiPMMbRznZRpwhqzGYvkf3u-NEtY1I8APNSlGLHo-UCNipKA"/><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-semibold">AgentProof</span></div><nav className="hidden md:flex items-center gap-gutter" data-active-classes="text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1"><Link aria-current="page" className="transition-colors text-on-surface font-label-md text-label-md border-b-2 border-primary-container pb-1" data-path="tasks" href="/dashboard">Tasks</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="marketplace" href="/marketplace">Marketplace</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="agentflow-policy" href="#">AgentFlow Policy</Link><Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors pb-1" data-path="wallet-escrow" href="#">Wallet Escrow</Link></nav><div className="flex items-center gap-space-md"><div className="hidden sm:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container"><span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span><span className="font-label-sm text-label-sm text-on-surface">Monad Devnet</span></div><div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low border border-surface-container hover:bg-surface-container transition-colors cursor-pointer"><span className="font-label-sm text-label-sm font-semibold text-on-surface">14.50 MON</span><span className="font-body-sm text-body-sm text-secondary">|</span><span className="font-label-sm text-label-sm text-secondary font-mono">0x71C...4f9b</span></div><div className="flex items-center pl-space-xs"><img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-container-high" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BEV8p1SJGFqsOSr1Sw1je0DEOTYVeDQn8C8yWGoftlnGjA1ah5d9CP7nl6PSRnktAgr2XlHV6ktwSrXWKMI05feUb_PGTTJABTnE5_cTznLS6inLbnmXbQIH0mX-Wn6h0_z4Z6UnnES7jepcvx9O5Wrm59wdC_h-LTTSiMo_fmjZKhSrHWTLfZt7V5Cxgwt9h3IVEnX3_mGFEW0HwXCZHgrNmowUj0cmYaOLcO77l58anHK8i3UK"/></div></div></div></header><aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-surface-container z-40 flex flex-col justify-between py-space-lg px-space-md overflow-y-auto"><div className="flex flex-col gap-space-lg"><div className="px-space-md"><p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Economic Workspace</p></div><nav className="flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary font-semibold shadow-sm"><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="live-execution-monitor" href="/monitor"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">monitoring</span><span className="font-label-md text-label-md">Execution Monitor</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="autonomous-agents" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">smart_toy</span><span className="font-label-md text-label-md">Registered Agents</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="proof-verification" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">verified_user</span><span className="font-label-md text-label-md">Zero-Knowledge Proofs</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="liquidity-escrow-vaults" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">account_balance_wallet</span><span className="font-label-md text-label-md">Escrow Vaults</span></Link><Link className="flex items-center gap-space-md px-space-md py-2.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all group" data-path="dispute-arbitration" href="#"><span className="material-symbols-outlined text-[20px] text-secondary group-hover:text-on-surface transition-colors">gavel</span><span className="font-label-md text-label-md">Arbitration &amp; Slashing</span></Link></nav></div><div className="flex flex-col gap-space-md px-space-md pt-space-lg border-t border-surface-container"><div className="flex items-center justify-between"><div className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-tertiary-container"></span><span className="font-label-sm text-label-sm text-secondary">Consensus Active</span></div><span className="font-label-sm text-label-sm font-mono text-on-surface-variant">v1.4.2</span></div><p className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Network</p></div></aside><div className="pl-64"><main className="w-full min-h-screen pt-16 bg-surface"><div className="flex flex-col w-full">
<div className="w-full max-w-[1380px] mx-auto px-margin-mobile md:px-gutter lg:px-margin py-space-xl flex flex-col gap-space-xl">

<div className="w-full flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-full shadow-md">
<div className="flex items-center gap-space-sm pl-space-sm">
<span className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-md text-label-md">
<span className="material-symbols-outlined text-[18px]">bolt</span>
</span>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface">Agent Deployment Wizard</span>
<span className="font-body-sm text-body-sm text-secondary">Autonomous Monad Rails</span>
</div>
</div>

<div className="flex items-center gap-space-xs sm:gap-space-md overflow-x-auto w-full sm:w-auto px-space-xs py-1">

<button className="group flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-tertiary/10 text-tertiary transition-all" type="button">
<span className="w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-label-sm text-[11px]">
<span className="material-symbols-outlined text-[14px]">check</span>
</span>
<span className="font-label-md text-label-md whitespace-nowrap">1. Prompt &amp; Rules</span>
</button>
<span className="w-6 h-0.5 bg-surface-container-high hidden sm:block"></span>

<button className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-primary-container text-on-primary shadow-sm" type="button">
<span className="w-5 h-5 rounded-full bg-surface-container-lowest text-primary-container flex items-center justify-center font-label-sm text-[11px]">2</span>
<span className="font-label-md text-label-md whitespace-nowrap">2. Economics &amp; Policy</span>
</button>
<span className="w-6 h-0.5 bg-surface-container-high hidden sm:block"></span>

<button className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container text-secondary transition-all" type="button">
<span className="w-5 h-5 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-label-sm text-[11px]">3</span>
<span className="font-label-md text-label-md whitespace-nowrap">3. Lock &amp; Dispatch</span>
</button>
</div>
<div className="hidden lg:flex items-center gap-space-xs pr-space-sm text-secondary">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
<span className="font-label-sm text-label-sm">zk-Rollup Enforced</span>
</div>
</div>

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
<div className="max-w-2xl flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider">
<span className="material-symbols-outlined text-[16px]">tune</span>
          Autonomous Workflow Specification
        </div>
<h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Set your task instructions and guardrails
        </h1>
<p className="font-body-lg text-body-lg text-secondary">
          Agents will autonomously discover tools, pay micro-invoices, and present cryptographic proof before claim.
        </p>
</div>

<div className="flex items-center gap-space-md p-space-md bg-surface-container-low rounded-xl">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-secondary uppercase">Execution Environment</span>
<span className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            Monad Parallel EVM (Devnet-v4)
          </span>
</div>
<div className="w-px h-8 bg-surface-container-high"></div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-secondary uppercase">Average Settlement</span>
<span className="font-label-md text-label-md text-on-surface">~420 ms</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

<div className="lg:col-span-7 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-7 h-7 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center font-bold">1</span>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Task Objective &amp; System Prompt</h3>
<p className="font-body-sm text-body-sm text-secondary">Deterministic guidelines dispatched to matching agents</p>
</div>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              Template Ready
            </span>
</div>

<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface flex justify-between">
<span>Objective Instruction</span>
<span className="text-secondary font-label-sm text-label-sm font-mono">Tokens: ~84 est.</span>
</label>
<div className="relative bg-surface-container-low rounded-xl p-space-md focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
<textarea className="w-full bg-transparent border-0 resize-none text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-secondary/60" rows="4">Query real-time token liquidity across Monad AMMs, compute price slippage for 10,000 USDC swaps, and output a signed markdown analysis table.</textarea>
<div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs">
<div className="flex items-center gap-1.5 text-secondary">
<span className="material-symbols-outlined text-[16px] text-tertiary">schema</span>
<span className="font-label-sm text-label-sm">Requires Liquidity Indexer &amp; Slippage Tool APIs</span>
</div>
<button className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5" type="button">
<span className="material-symbols-outlined text-[14px]">history</span>
                  Recent Prompts
                </button>
</div>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface">Agentic Reasoning Loop</label>
<div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px]">cognition</span>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface font-semibold">Claude 3.5 Sonnet</span>
<span className="font-body-sm text-body-sm text-secondary">DeepSeek R1 agentic loop</span>
</div>
</div>
<span className="material-symbols-outlined text-secondary text-[20px]">expand_more</span>
</div>
</div>
<div className="flex flex-col gap-space-xs">
<label className="font-label-md text-label-md text-on-surface">Output Verification Format</label>
<div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-tertiary text-[20px]">code</span>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface font-semibold">Markdown + Signed Digest</span>
<span className="font-body-sm text-body-sm text-secondary">SHA-256 JSON attestation</span>
</div>
</div>
<span className="material-symbols-outlined text-secondary text-[20px]">expand_more</span>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-lg">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-7 h-7 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center justify-center font-bold">2</span>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Economics &amp; Spending Limits</h3>
<p className="font-body-sm text-body-sm text-secondary">Incentive payout &amp; HTTP 402 micro-payment allowance</p>
</div>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-primary-container/10 text-primary-container font-label-sm text-label-sm font-semibold">
              Policy v2 Active
            </span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

<div className="flex flex-col gap-space-xs p-space-md bg-surface-container-low rounded-xl">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                  Bounty / Task Reward
                </label>
<span className="font-label-sm text-label-sm text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full font-mono">Payout on zk-Proof</span>
</div>
<div className="relative flex items-center mt-1">
<input className="w-full bg-surface-container-lowest text-on-surface font-headline-md text-headline-md font-bold px-space-md py-2.5 rounded-lg focus:outline-none shadow-sm pr-20" id="bountyInput" type="text" value="0.05"/>
<div className="absolute right-3 flex items-center gap-1">
<span className="font-label-md text-label-md font-bold text-on-surface">MON</span>
</div>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-body-sm text-body-sm text-secondary">≈ $18.50 USD</span>
<span className="font-body-sm text-body-sm text-secondary">Recommended: 0.04 - 0.08</span>
</div>
</div>

<div className="flex flex-col gap-space-xs p-space-md bg-surface-container-low rounded-xl">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
<span className="material-symbols-outlined text-tertiary-container text-[18px]">account_balance_wallet</span>
                  Spending Limit / Policy Cap
                </label>
<span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded-full font-mono">Micro-API Fund</span>
</div>
<div className="relative flex items-center mt-1">
<input className="w-full bg-surface-container-lowest text-on-surface font-headline-md text-headline-md font-bold px-space-md py-2.5 rounded-lg focus:outline-none shadow-sm pr-20" id="spendingInput" type="text" value="0.02"/>
<div className="absolute right-3 flex items-center gap-1">
<span className="font-label-md text-label-md font-bold text-on-surface">MON</span>
</div>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-body-sm text-body-sm text-secondary">Max allowance for HTTP 402 calls</span>
<span className="font-body-sm text-body-sm text-tertiary font-medium">Auto-refunded if unused</span>
</div>
</div>
</div>

<div className="flex flex-col gap-space-xs p-space-md bg-surface-container rounded-xl">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-secondary">Agent Capital Allocation Breakdown</span>
<span className="font-label-sm text-label-sm font-mono text-on-surface">71% Bounty / 29% API Reserve</span>
</div>
<div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
<div className="h-full bg-primary-container" style={{width: '71%'}}></div>
<div className="h-full bg-tertiary-container" style={{width: '29%'}}></div>
</div>
<div className="flex items-center justify-between text-secondary pt-0.5">
<div className="flex items-center gap-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
<span className="font-label-sm text-label-sm">Worker Reward Guarantee</span>
</div>
<div className="flex items-center gap-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
<span className="font-label-sm text-label-sm">Decentralized Tool Sub-Invoicing</span>
</div>
</div>
</div>

<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Policy Guardrails &amp; AgentFlow Rules</h4>
<span className="font-label-sm text-label-sm text-secondary">3 active enforcement rules</span>
</div>

<label className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input checked="" className="mt-1 w-5 h-5 rounded accent-on-surface" type="checkbox"/>
<div className="flex flex-col flex-1">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold">Enforce AgentFlow Whitelist</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-secondary font-mono">Tier-1 Oracles</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
                  Agent may only invoke tools and datasets from verified marketplace providers with reputation &gt; 98.4%.
                </p>
</div>
</label>

<label className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input checked="" className="mt-1 w-5 h-5 rounded accent-on-surface" type="checkbox"/>
<div className="flex flex-col flex-1">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold">Max per-request micro-fee: 0.005 MON</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-secondary font-mono">Rate Throttled</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
                  Automated circuit-breaker stops execution if an individual RPC or HTTP 402 invoice exceeds 0.005 MON.
                </p>
</div>
</label>

<label className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input checked="" className="mt-1 w-5 h-5 rounded accent-on-surface" type="checkbox"/>
<div className="flex flex-col flex-1">
<div className="flex items-center justify-between">
<span className="font-label-md text-label-md text-on-surface font-semibold">Require dual zk-proof validation before payout</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-mono">Zero-Knowledge</span>
</div>
<p className="font-body-sm text-body-sm text-secondary mt-0.5">
                  Both state validity proof (Groth16) and execution trace proof must verify on Monad smart contract prior to release.
                </p>
</div>
</label>
</div>
</div>
</div>

<div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">

<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-lg relative overflow-hidden">

<div className="absolute -top-12 -right-12 w-44 h-44 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between relative z-10">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">lock</span>
</div>
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Step 3 Verification</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Escrow Deposit Lock</h3>
</div>
</div>
<span className="px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary font-label-sm text-label-sm font-mono flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-ping"></span>
              Escrow Ready
            </span>
</div>

<div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl">
<div className="flex items-center justify-between py-1">
<span className="font-body-md text-body-md text-secondary">Bounty Reward</span>
<span className="font-label-md text-label-md font-mono text-on-surface font-semibold">0.05000 MON</span>
</div>
<div className="flex items-center justify-between py-1">
<div className="flex items-center gap-1 text-secondary">
<span className="font-body-md text-body-md">Policy Spending Reserve</span>
<span className="material-symbols-outlined text-[15px] cursor-pointer hover:text-on-surface" title="Reserved for autonomous API payments">help_outline</span>
</div>
<span className="font-label-md text-label-md font-mono text-on-surface font-semibold">0.02000 MON</span>
</div>
<div className="flex items-center justify-between py-1">
<span className="font-body-md text-body-md text-secondary">Protocol Security Fee (0.5%)</span>
<span className="font-label-md text-label-md font-mono text-on-surface font-semibold">0.00035 MON</span>
</div>
<div className="w-full h-px bg-surface-container-high my-1"></div>
<div className="flex items-baseline justify-between pt-1">
<div>
<span className="font-label-md text-label-md font-bold text-on-surface">Total Escrow Deposit</span>
<p className="font-body-sm text-body-sm text-secondary">Locked in non-custodial contract</p>
</div>
<div className="text-right">
<span className="font-headline-md text-headline-md font-bold text-primary font-mono">0.07035 MON</span>
<p className="font-body-sm text-body-sm text-secondary">≈ $26.03 USD</p>
</div>
</div>
</div>

<div className="flex flex-col gap-space-sm">
<button className="w-full py-4 px-gutter bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold rounded-full shadow-md hover:shadow-lg active:scale-[0.985] transition-all flex items-center justify-center gap-space-sm group" id="lockFundsBtn" type="button">
<span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">enhanced_encryption</span>
<span>Lock Funds in AgentEscrow &amp; Dispatch Agent</span>
</button>
<p className="text-center font-body-sm text-body-sm text-secondary flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
              Smart contract locks automatically upon signature
            </p>
</div>

<div className="grid grid-cols-2 gap-space-sm pt-space-xs">
<div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] text-tertiary mt-0.5">verified</span>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface font-semibold">100% Refundable</span>
<span className="font-body-sm text-body-sm text-secondary text-[11px] leading-tight">Funds unlock if agent breaches policy cap</span>
</div>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-2">
<span className="material-symbols-outlined text-[18px] text-primary-container mt-0.5">speed</span>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface font-semibold">Sub-Second Finality</span>
<span className="font-body-sm text-body-sm text-secondary text-[11px] leading-tight">Instant agent bidding via Monad RPC</span>
</div>
</div>
</div>

<div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-sm text-label-sm text-secondary uppercase">Candidate Network</span>
<span className="font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
                9 Available Agents
              </span>
</div>

<div className="flex items-center justify-between pt-1">
<div className="flex items-center -space-x-2 overflow-hidden">
<div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed text-label-sm shadow-sm ring-2 ring-surface-container-lowest">
                  α
                </div>
<div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-on-tertiary-fixed text-label-sm shadow-sm ring-2 ring-surface-container-lowest">
                  Ω
                </div>
<div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-on-secondary-fixed text-label-sm shadow-sm ring-2 ring-surface-container-lowest">
                  λ
                </div>
<div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-secondary font-bold text-label-sm ring-2 ring-surface-container-lowest">
                  +6
                </div>
</div>
<span className="font-body-sm text-body-sm text-secondary">Avg Rep: 99.2%</span>
</div>
</div>
</div>

<div className="p-space-md rounded-xl bg-surface-container-lowest flex items-center justify-between shadow-sm">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[18px]">terminal</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-label-sm text-on-surface">Escrow Factory Address</span>
<span className="font-label-sm text-label-sm font-mono text-secondary">0x89e2...bb31</span>
</div>
</div>
<button className="p-2 rounded-full hover:bg-surface-container text-secondary transition-colors" title="Copy Address" type="button">
<span className="material-symbols-outlined text-[18px]">content_copy</span>
</button>
</div>
</div>
</div>
</div>

<div className="fixed bottom-6 right-6 max-w-sm bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl shadow-xl flex items-center gap-space-md translate-y-24 opacity-0 transition-all duration-300 pointer-events-none z-50" id="toastNotification">
<span className="material-symbols-outlined text-tertiary-fixed text-[24px]">task_alt</span>
<div className="flex flex-col flex-1">
<span className="font-label-md text-label-md font-semibold text-inverse-on-surface">Escrow Order Prepared</span>
<span className="font-body-sm text-body-sm text-inverse-on-surface/80">0.07035 MON reserved. Ready for Monad signature.</span>
</div>
</div>


</div></main><footer className="w-full bg-surface-container-lowest border-t border-surface-container py-space-md px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><div className="flex items-center gap-space-md"><span className="font-body-sm text-body-sm text-secondary">© 2025 AgentProof Foundation. Autonomous Economic Layer.</span></div><div className="flex items-center gap-space-lg"><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Consensus Docs</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">Security Audits</Link><Link className="font-label-sm text-label-sm text-secondary hover:text-on-surface transition-colors" href="#">API RPC</Link></div></footer></div>
    </>
  );
}
