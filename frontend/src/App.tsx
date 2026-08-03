import { useState, useEffect } from 'react';
import { useGenLayer } from './hooks/useGenLayer';
import { Navbar } from './components/Navbar';
import { BorrowerDashboard as P2PMarket } from './components/BorrowerDashboard';
import { LenderDashboard as MerchantHub } from './components/LenderDashboard';
import { DisputePanel as DisputeCenter } from './components/DisputePanel';
import { AlertTriangle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'market' | 'merchant' | 'dispute'>('market');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('trustlend_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('trustlend_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const {
    address,
    balance,
    isConnected,
    isConnecting,
    contractAddress,
    connectWallet,
    readContract,
    writeContract,
    txPending,
    txMessage,
  } = useGenLayer();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-250 ${theme === 'light' ? 'bg-[#F8FAFC] text-slate-800' : 'bg-[#090A0D] text-slate-100'}`}>
      {/* Navbar */}
      <Navbar
        address={address}
        balance={balance}
        isConnected={isConnected}
        isConnecting={isConnecting}
        contractAddress={contractAddress}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onConnect={connectWallet}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Contract Warning Banner */}
      {!contractAddress && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs text-amber-500 flex items-center justify-center gap-2 font-mono-data">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Waiting for contract deployment:</strong> Please deploy <code className="bg-black/10 px-1.5 py-0.5 rounded text-amber-600">contracts/trustlend.py</code> to GenLayer Studio (studionet) and add <code className="bg-black/10 px-1.5 py-0.5 rounded text-amber-600">VITE_CONTRACT_ADDRESS</code> to your frontend <code className="bg-black/10 px-1.5 py-0.5 rounded text-amber-600">.env</code> file.
          </span>
        </div>
      )}

      {/* Consensus Pending Modal */}
      {txPending && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ks-panel p-8 rounded-2xl border border-emerald-500/30 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Escrow Consensus in Progress</h3>
              <p className="text-xs text-slate-300 mt-1">{txMessage}</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl text-left border border-white/5 text-[11px] text-slate-400 space-y-1 font-mono-data">
              <p className="flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Optimistic Democracy Consensus
              </p>
              <p>Multiple validator nodes are inspecting the bank payment receipt and comparing verdicts on GenLayer studionet.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">
        {activeTab === 'market' && (
          <P2PMarket
            address={address}
            readContract={readContract}
            writeContract={writeContract}
          />
        )}

        {activeTab === 'merchant' && (
          <MerchantHub
            address={address}
            readContract={readContract}
            writeContract={writeContract}
          />
        )}

        {activeTab === 'dispute' && (
          <DisputeCenter
            readContract={readContract}
            writeContract={writeContract}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-500/15 py-6 px-4 text-center text-xs text-slate-500 space-y-2 font-mono-data">
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> GenLayer Intelligent Escrow</span>
          <span>•</span>
          <span>studionet</span>
          <span>•</span>
          <span>10% Security Deposit Protection</span>
        </div>
        <p>© 2026 TrustLend P2P Escrow. Automated Fiat-to-Crypto Escrow Exchange.</p>
      </footer>
    </div>
  );
}

export default App;
