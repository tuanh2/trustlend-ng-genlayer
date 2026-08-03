import React from 'react';
import { Wallet, ShieldCheck, RefreshCw, ShoppingCart, Briefcase, Gavel, Zap } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* Brand Logo & Status */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-purple-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 transform transition-transform hover:scale-105">
          <ShieldCheck className="w-6 h-6 text-slate-950 font-black" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-display">
              TrustLend <span className="emerald-gradient-text">P2P Escrow</span>
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 animate-pulse" /> AI Release
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono-data flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            GenLayer studionet • 10% Security Deposit Protected
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
            activeTab === 'market'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          P2P Market
        </button>

        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
            activeTab === 'merchant'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Merchant Hub
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
            activeTab === 'dispute'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gavel className="w-4 h-4" />
          AI Anti-Fraud Audit
        </button>
      </nav>

      {/* Wallet Controls */}
      <div className="flex items-center gap-3">
        {contractAddress && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono-data text-slate-400">
            <span className="text-slate-500">CA:</span>
            <span className="text-emerald-400 font-bold">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-1.5 pl-3.5 shadow-lg shadow-emerald-500/10">
            <div className="text-right pr-1">
              <div className="text-[10px] text-slate-400 font-medium">Balance</div>
              <div className="text-xs font-black text-emerald-400 font-mono-data">{balance} GEN</div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-mono-data font-black border border-emerald-500/30 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {formatAddr(address)}
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="btn-shimmer flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-xl shadow-emerald-500/25 disabled:opacity-50 active:scale-95"
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
