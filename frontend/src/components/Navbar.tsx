import React from 'react';
import { Wallet, ShieldCheck, RefreshCw, ShoppingCart, Briefcase, Gavel } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#070A12]/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
          <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-display">
              TrustLend <span className="text-emerald-400">P2P Escrow</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              AI Automated Release
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono-data flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            GenLayer studionet • 10% Security Deposit Protected
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'market'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          P2P Escrow Market
        </button>

        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'merchant'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Merchant Escrow Hub
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'dispute'
              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gavel className="w-4 h-4" />
          AI Audit & Anti-Fraud
        </button>
      </nav>

      {/* Wallet Controls */}
      <div className="flex items-center gap-3">
        {contractAddress && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-mono-data text-slate-400">
            <span className="text-slate-500">CA:</span>
            <span className="text-emerald-400 font-medium">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl p-1 pl-3">
            <div className="text-right pr-1">
              <div className="text-[10px] text-slate-400 font-medium">Balance</div>
              <div className="text-xs font-black text-emerald-400 font-mono-data">{balance} GEN</div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono-data font-bold border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {formatAddr(address)}
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" /> Connect MetaMask
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
