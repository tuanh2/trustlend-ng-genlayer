import React from 'react';
import { Wallet, RefreshCw, ShoppingCart, ShieldCheck, Zap, Sun, Moon, ArrowRightLeft } from 'lucide-react';

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
  theme = 'dark',
  onToggleTheme,
}) => {
  const formatAddr = (addr: string) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

  return (
    <header className={`sticky top-0 z-40 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 transition-colors duration-250 border-b ${
      theme === 'light'
        ? 'bg-white/95 border-slate-200 shadow-sm'
        : 'bg-[#090A0D]/95 border-[#F5C842]/16 shadow-2xl'
    }`}>
      {/* Brand Lockup */}
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-sm bg-[#D97706] text-white flex items-center justify-center font-mono-data font-black text-sm border border-amber-300">
          /
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl font-wordmark tracking-widest font-normal ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              TRUSTLEND <span className="text-[#D97706]">P2P ESCROW</span>
            </h1>
            <span className="ks-badge-patina px-2 py-0.5 text-[10px] font-mono-data font-medium rounded-xs flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[#0D9488]" /> Automated Verification
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono-data flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0D9488]"></span>
            GenLayer studionet • 10% Security Bond Protection
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className={`flex items-center gap-1 p-1 rounded-sm border ${
        theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-[#040507] border-[#F5C842]/16'
      }`}>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
            activeTab === 'market'
              ? 'bg-[#D97706] text-white font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          P2P Escrow Market
        </button>

        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
            activeTab === 'merchant'
              ? 'bg-[#0D9488] text-white font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Merchant Escrow Hub
        </button>

        <button
          onClick={() => setActiveTab('dispute')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
            activeTab === 'dispute'
              ? 'bg-slate-700 text-white font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          Anti-Fraud Audit Log
        </button>
      </nav>

      {/* Wallet & Theme Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleTheme}
          className={`px-3 py-1.5 rounded-xs text-xs font-mono-data font-bold flex items-center gap-1.5 transition-all border ${
            theme === 'light'
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              : 'bg-[#101216] hover:bg-[#16181D] border-[#F5C842]/20 text-[#F5C842]'
          }`}
          title="Toggle Light / Dark Mode"
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#F5C842]" /> Dark Mode
            </>
          )}
        </button>

        {contractAddress && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xs bg-slate-100 dark:bg-[#040507] border border-slate-300 dark:border-[#F5C842]/16 text-xs font-mono-data text-slate-500">
            <span className="text-slate-400">CA:</span>
            <span className="text-[#D97706] font-medium">{formatAddr(contractAddress)}</span>
          </div>
        )}

        {isConnected ? (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#101216] border border-[#0D9488]/30 rounded-xs p-1 pl-3">
            <div className="text-right pr-1">
              <div className="text-[10px] text-slate-500">Balance</div>
              <div className="text-xs font-bold text-[#0D9488] font-mono-data">{balance} GEN</div>
            </div>
            <div className="px-2.5 py-1 rounded-xs bg-[#0D9488]/10 text-[#0D9488] text-xs font-mono-data font-medium border border-[#0D9488]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]"></span>
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
