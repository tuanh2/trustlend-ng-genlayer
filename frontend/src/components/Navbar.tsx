import React from 'react';
import { Wallet, RefreshCw, ShoppingCart, ShieldCheck, ArrowRightLeft } from 'lucide-react';

interface NavbarProps {
  address: string;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  contractAddress: string | null;
  activeTab: 'market' | 'merchant' | 'dispute';
  setActiveTab: (tab: 'market' | 'merchant' | 'dispute') => void;
  onConnect: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
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
    <header className="sticky top-0 z-40 bg-[#050507]/90 backdrop-blur-md border-b border-[#1F2026] px-6 lg:px-12 py-3.5 flex items-center justify-between gap-4">
      {/* Clean Brand Lockup */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-[#F59E0B] text-black flex items-center justify-center font-bold text-xs">
          TL
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            TrustLend <span className="text-[#F59E0B]">P2P</span>
          </h1>
          <p className="text-[11px] text-[#9CA3AF] font-mono-data">
            GenLayer studionet • 10% Bond Protection
          </p>
        </div>
      </div>

      {/* Clean Tabs */}
      <nav className="flex items-[#0E0F12] p-1 rounded-lg border border-[#1F2026]">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'market'
              ? 'bg-[#1F2026] text-white font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          P2P Market
        </button>

        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'merchant'
              ? 'bg-[#1F2026] text-white font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Merchant Hub
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
            activeTab === 'dispute'
              ? 'bg-[#1F2026] text-white font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Audit Logs
        </button>
      </nav>

      {/* Wallet Controls */}
      <div className="flex items-center gap-3">
        {contractAddress && (
          <div className="hidden xl:block text-xs font-mono-data text-[#6B7280]">
            CA: <span className="text-[#9CA3AF]">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-[#0E0F12] border border-[#1F2026] rounded-lg px-3 py-1.5 text-xs font-mono-data">
            <span className="text-[#9CA3AF]">{balance} GEN</span>
            <span className="w-1 h-3 bg-[#1F2026]"></span>
            <span className="text-[#10B981] font-medium">{formatAddr(address)}</span>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="min-btn-primary px-4 py-1.5 text-xs flex items-center gap-2"
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
