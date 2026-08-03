import React from 'react';
import { Wallet, Sparkles, ExternalLink } from 'lucide-react';
import { EXPLORER_URL } from '../config/chain';

interface NavbarProps {
  address: string;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  contractAddress: string;
  activeTab: 'borrower' | 'lender' | 'dispute';
  setActiveTab: (tab: 'borrower' | 'lender' | 'dispute') => void;
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
  const shortAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  return (
    <header className="sticky top-0 z-50 bg-dark-base/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Network */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-dark-base rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                TrustLend<span className="text-emerald-400 font-extrabold ml-1">NG</span>
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                GenLayer Studionet
              </span>
            </div>
            <p className="text-xs text-slate-400">AI Subjective Microcredit Protocol</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex bg-dark-card p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('borrower')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'borrower'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Borrower Portal
          </button>
          <button
            onClick={() => setActiveTab('lender')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'lender'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Liquidity Pool
          </button>
          <button
            onClick={() => setActiveTab('dispute')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dispute'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dispute Arbitration
          </button>
        </nav>

        {/* Wallet & Explorer */}
        <div className="flex items-center gap-3">
          {contractAddress && (
            <a
              href={`${EXPLORER_URL}/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
              title="Inspect Contract on GenLayer Explorer"
            >
              <span>Contract</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2 bg-dark-card p-1.5 pl-3 rounded-xl border border-emerald-500/20">
              <div className="text-right">
                <div className="text-xs font-bold text-white">{balance} GEN</div>
                <div className="text-[10px] text-slate-400">{shortAddr(address)}</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
