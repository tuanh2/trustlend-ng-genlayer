import React from 'react';
import { Wallet, RefreshCw, ShoppingCart, Bot, Gavel, Zap } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#090A0D]/95 border-b border-[#F5C842]/16 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Impeccable Brand Lockup (impeccable.style/docs) */}
      <div className="flex items-center gap-3.5">
        {/* Carved Tile Mark Glyph [ / ] */}
        <div className="w-8 h-8 rounded-sm bg-[#F5C842] flex items-center justify-center font-mono-data text-[#090A0D] font-black text-sm border border-[#FDE68A]">
          /
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-wordmark text-white tracking-widest font-normal">
              TRUSTLEND <span className="text-[#F5C842]">P2P ESCROW</span>
            </h1>
            <span className="ks-badge-patina px-2 py-0.5 text-[10px] font-mono-data font-medium rounded-xs flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[#14B8A6]" /> AI Auto-Release
            </span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] font-mono-data flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
            GenLayer studionet • 10% Security Bond Protected
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#040507] p-1 rounded-sm border border-[#F5C842]/16">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
            activeTab === 'market'
              ? 'bg-[#F5C842] text-[#090A0D] font-bold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          P2P Escrow Market
        </button>

        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
            activeTab === 'merchant'
              ? 'bg-[#14B8A6] text-[#090A0D] font-bold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          Merchant AI Bot
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
            activeTab === 'dispute'
              ? 'bg-[#16181D] text-white border border-[#F5C842]/30 font-bold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <Gavel className="w-3.5 h-3.5 text-[#F5C842]" />
          AI Anti-Fraud Audit
        </button>
      </nav>

      {/* Wallet Controls */}
      <div className="flex items-center gap-3">
        {contractAddress && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xs bg-[#040507] border border-[#F5C842]/16 text-xs font-mono-data text-[#9CA3AF]">
            <span className="text-[#6B7280]">CA:</span>
            <span className="text-[#F5C842] font-medium">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-[#101216] border border-[#14B8A6]/30 rounded-xs p-1 pl-3">
            <div className="text-right pr-1">
              <div className="text-[10px] text-[#9CA3AF]">Balance</div>
              <div className="text-xs font-bold text-[#14B8A6] font-mono-data">{balance} GEN</div>
            </div>
            <div className="px-2.5 py-1 rounded-xs bg-[#14B8A6]/10 text-[#2DD4BF] text-xs font-mono-data font-medium border border-[#14B8A6]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]"></span>
              {formatAddr(address)}
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="ks-button-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-2"
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
