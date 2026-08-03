import React from 'react';
import { Wallet, RefreshCw, ShoppingCart, Briefcase, Gavel, Zap } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#07080A]/95 backdrop-blur-2xl border-b border-[#F5C842]/20 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* Impeccable Brand Lockup */}
      <div className="flex items-center gap-3.5">
        {/* Carved Tile Mark Glyph [ / ] */}
        <div className="w-9 h-9 rounded bg-[#F5C842] flex items-center justify-center font-mono-data text-[#0B0C0E] font-black text-sm shadow-md shadow-[#F5C842]/20 border border-[#FDE68A]">
          /
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black font-wordmark text-white tracking-widest">
              TRUSTLEND <span className="text-[#F5C842]">P2P ESCROW</span>
            </h1>
            <span className="ks-badge-patina px-2.5 py-0.5 text-[10px] font-mono-data font-bold rounded flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[#14B8A6]" /> AI Release
            </span>
          </div>
          <p className="text-[11px] text-[#94A3B8] font-mono-data flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
            GenLayer studionet • 10% Security Deposit Protected
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#121417] p-1 rounded-md border border-[#F5C842]/15">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${
            activeTab === 'market'
              ? 'bg-[#F5C842] text-[#0B0C0E] shadow-md shadow-[#F5C842]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          P2P Market
        </button>

        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${
            activeTab === 'merchant'
              ? 'bg-[#14B8A6] text-[#0B0C0E] shadow-md shadow-[#14B8A6]/20'
              : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Merchant Hub
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${
            activeTab === 'dispute'
              ? 'bg-[#21252B] text-white border border-[#F5C842]/30'
              : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
          }`}
        >
          <Gavel className="w-3.5 h-3.5 text-[#F5C842]" />
          AI Audit & Anti-Fraud
        </button>
      </nav>

      {/* Wallet Controls */}
      <div className="flex items-center gap-3">
        {contractAddress && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded bg-[#050607] border border-[#F5C842]/20 text-xs font-mono-data text-[#94A3B8]">
            <span className="text-[#64748B]">CA:</span>
            <span className="text-[#F5C842] font-bold">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-[#121417] border border-[#14B8A6]/30 rounded p-1 pl-3">
            <div className="text-right pr-1">
              <div className="text-[10px] text-[#94A3B8] font-medium">Balance</div>
              <div className="text-xs font-bold text-[#14B8A6] font-mono-data">{balance} GEN</div>
            </div>
            <div className="px-3 py-1 rounded bg-[#14B8A6]/10 text-[#2DD4BF] text-xs font-mono-data font-bold border border-[#14B8A6]/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span>
              {formatAddr(address)}
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="ks-button-primary px-5 py-2 text-xs font-bold flex items-center gap-2"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-3.5 h-3.5" /> Connect Wallet
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
