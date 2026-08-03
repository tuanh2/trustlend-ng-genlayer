import { useState } from 'react';
import { useGenLayer } from './hooks/useGenLayer';
import { Navbar } from './components/Navbar';
import { BorrowerDashboard } from './components/BorrowerDashboard';
import { LenderDashboard } from './components/LenderDashboard';
import { DisputePanel } from './components/DisputePanel';
import { AlertTriangle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'borrower' | 'lender' | 'dispute'>('borrower');

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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
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
      />

      {/* Contract Warning Banner */}
      {!contractAddress && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Waiting for contract deployment:</strong> Please deploy <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">contracts/trustlend.py</code> to GenLayer Studio (studionet) and add <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">VITE_CONTRACT_ADDRESS</code> to your frontend <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-200">.env</code> file.
          </span>
        </div>
      )}

      {/* Consensus Pending Modal */}
      {txPending && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-3xl border border-emerald-500/30 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Consensus in Progress</h3>
              <p className="text-xs text-slate-300 mt-1">{txMessage}</p>
            </div>
            <div className="p-3 bg-dark-base rounded-xl text-left border border-white/5 text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1 font-semibold text-emerald-400">
                <Sparkles className="w-3 h-3" /> Optimistic Democracy Consensus
              </p>
              <p>Multiple LLM validator nodes are rendering evidence and comparing subjective verdicts on GenLayer studionet.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">
        {activeTab === 'borrower' && (
          <BorrowerDashboard
            address={address}
            readContract={readContract}
            writeContract={writeContract}
          />
        )}

        {activeTab === 'lender' && (
          <LenderDashboard
            address={address}
            readContract={readContract}
            writeContract={writeContract}
          />
        )}

        {activeTab === 'dispute' && (
          <DisputePanel
            readContract={readContract}
            writeContract={writeContract}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Powered by GenLayer AI</span>
          <span>•</span>
          <span>studionet</span>
          <span>•</span>
          <span>React + Vite + TypeScript</span>
        </div>
        <p>© 2026 TrustLend NG. P2P Microcredit for the Unbanked via Subjective Smart Contracts.</p>
      </footer>
    </div>
  );
}

export default App;
