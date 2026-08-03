import React from 'react';
import { Wallet, RefreshCw, ShoppingCart, Briefcase, Gavel, Zap, Cpu } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#050811]/90 backdrop-blur-2xl border-b border-[#00F2FE]/20 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* GenLayer Brand Lockup */}
      <div className="flex items-center gap-3.5">
        {/* Cyber CPU Glyph */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F2FE] to-[#00FF87] flex items-center justify-center text-[#050811] shadow-lg shadow-[#00F2FE]/20 border border-[#7DD3FC]">
          <Cpu className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-tight">
              TrustLend <span className="gl-cyan-gradient">P2P Escrow</span>
            </h1>
            <span className="gl-badge-emerald px-2.5 py-0.5 text-[10px] font-mono-data font-black rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[#00FF87]" /> AI Auto-Release
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono-data flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00FF87] animate-ping"></span>
            GenLayer studionet • 10% Security Deposit Protection
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#0F172A] p-1.5 rounded-2xl border border-[#00F2FE]/20 shadow-inner">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'market'
              ? 'gl-btn-cyan text-[#050811] shadow-md shadow-[#00F2FE]/30 scale-105'
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
              ? 'gl-btn-gold text-[#050811] shadow-md shadow-[#F59E0B]/30 scale-105'
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
              ? 'bg-[#1E293B] text-white border border-[#00F2FE]/40 shadow-md shadow-purple-500/20 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gavel className="w-4 h-4 text-[#00F2FE]" />
          AI Audit & Anti-Fraud
        </button>
      </nav>

      {/* Wallet Controls */}
      <div className="flex items-center gap-3">
        {contractAddress && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B1120] border border-[#00F2FE]/20 text-xs font-mono-data text-slate-400">
            <span className="text-slate-500">CA:</span>
            <span className="text-[#38BDF8] font-bold">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-[#0F172A] border border-[#00FF87]/30 rounded-2xl p-1.5 pl-3.5">
            <div className="text-right pr-1">
              <div className="text-[10px] text-slate-400 font-medium">Balance</div>
              <div className="text-xs font-black text-[#00FF87] font-mono-data">{balance} GEN</div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#00FF87]/15 text-[#00FF87] text-xs font-mono-data font-black border border-[#00FF87]/30 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF87] animate-pulse"></span>
              {formatAddr(address)}
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="gl-btn-cyan px-6 py-2.5 text-xs font-black flex items-center gap-2"
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
