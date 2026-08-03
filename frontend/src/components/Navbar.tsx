import React from 'react';
import { Wallet, RefreshCw, ShoppingCart, Briefcase, Gavel, Zap, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  address: string;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  contractAddress: string | null;
  activeTab: 'market' | 'merchant' | 'dispute';
  setActiveTab: (tab: 'market' | 'merchant' | 'dispute') => void;
  onConnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  address,
  balance,
  isConnected,
  isConnecting,
  contractAddress,
  activeTab,
  setActiveTab,
  onConnect,
}) => {
  const formatAddr = (addr: string) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

  return (
    <header className="sticky top-0 z-40 bg-[#07040D]/90 backdrop-blur-2xl border-b border-[#A855F7]/25 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* Royal Obsidian Brand Lockup */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A855F7] via-[#C084FC] to-[#38BDF8] flex items-center justify-center text-white shadow-lg shadow-[#A855F7]/30 border border-[#E9D5FF]">
          <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black font-syne text-white tracking-tight">
              TrustLend <span className="gl-violet-gradient">P2P Escrow</span>
            </h1>
            <span className="gl-badge-violet px-3 py-0.5 text-[10px] font-mono-data font-black rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[#A855F7]" /> AI Auto-Release
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono-data flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#A855F7] animate-ping"></span>
            GenLayer studionet • 10% Security Deposit Protected
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#0F091F] p-1.5 rounded-2xl border border-[#A855F7]/20 shadow-inner">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'market'
              ? 'gl-btn-violet text-white shadow-md shadow-[#A855F7]/30 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          P2P Escrow Market
        </button>

        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'merchant'
              ? 'bg-[#A855F7]/20 text-[#E9D5FF] border border-[#A855F7]/40 shadow-md shadow-purple-500/20 scale-105 font-syne'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Merchant Hub
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'dispute'
              ? 'bg-[#1E1B4B] text-white border border-[#A855F7]/40 shadow-md shadow-purple-500/20 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gavel className="w-4 h-4 text-[#A855F7]" />
          AI Audit & Anti-Fraud
        </button>
      </nav>

      {/* Wallet Controls */}
      <div className="flex items-center gap-3">
        {contractAddress && (
          <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0F091F] border border-[#A855F7]/20 text-xs font-mono-data text-slate-400">
            <span className="text-slate-500">CA:</span>
            <span className="text-[#C084FC] font-bold">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-[#0F091F] border border-[#A855F7]/30 rounded-2xl p-1.5 pl-3.5">
            <div className="text-right pr-1">
              <div className="text-[10px] text-slate-400 font-medium">Balance</div>
              <div className="text-xs font-black text-[#E9D5FF] font-mono-data">{balance} GEN</div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#A855F7]/15 text-[#E9D5FF] text-xs font-mono-data font-black border border-[#A855F7]/30 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-pulse"></span>
              {formatAddr(address)}
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="gl-btn-violet px-6 py-2.5 text-xs font-black flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" /> Connect Wallet
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
