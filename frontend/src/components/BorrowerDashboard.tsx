import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, ShieldCheck, AlertOctagon, CheckCircle2, Copy, Sparkles, ExternalLink, ArrowRight, Zap, Cpu, Play, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import type { P2POrder } from '../types';

interface P2PMarketProps {
  address: string;
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const BorrowerDashboard: React.FC<P2PMarketProps> = ({
  address,
  readContract,
  writeContract,
}) => {
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Interactive Live Demo Simulator State
  const [demoSelected, setDemoSelected] = useState<number>(0);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  // Preset Demo Bank Receipts
  const sampleProofs = [
    {
      id: 0,
      label: '🏦 Vietcombank Official E-Receipt (Valid Match)',
      url: 'https://vcb.com.vn/verify?tx=987654321',
      bankName: 'Vietcombank',
      accountNumber: '9988776655',
      holderName: 'TRIN THI NGAN',
      amount: '2,500,000 VND',
      memo: 'TLENG-88F3A',
      desc: 'Official Vietcombank receipt link matching account, amount & memo TLENG-88F3A.',
      badge: '99.8% AI Match',
      badgeClass: 'gl-badge-emerald',
      verdict: 'MATCHED',
      reason: 'Verified official Vietcombank E-Receipt link. Transferred 2,500,000 VND to account 9988776655 with matching memo TLENG-88F3A.',
    },
    {
      id: 1,
      label: '💳 Moniepoint POS Slip (Valid Match)',
      url: 'https://moniepoint.com/receipt/MP-998877',
      bankName: 'Moniepoint POS',
      accountNumber: '9988776655',
      holderName: 'TRIN THI NGAN',
      amount: '2,500,000 VND',
      memo: 'TLENG-88F3A',
      desc: 'Valid digital POS receipt matching transfer amount and reference code.',
      badge: '100% Verified',
      badgeClass: 'gl-badge-emerald',
      verdict: 'MATCHED',
      reason: 'Verified POS digital slip content matching merchant bank account and required memo code TLENG-88F3A.',
    },
    {
      id: 2,
      label: '⚠️ Tampered / Photoshopped Receipt (Triggers 10% Slash)',
      url: 'https://fake-receipts.com/tampered-slip.png',
      bankName: 'Unknown / Fake',
      accountNumber: '1122334455',
      holderName: 'FAKE ACCOUNT',
      amount: '500,000 VND',
      memo: 'WRONG-MEMO',
      desc: 'Invalid or photoshopped receipt URL. GenLayer AI flags FRAUD and slashes deposit.',
      badge: 'FRAUD - Slashed',
      badgeClass: 'gl-badge-rose',
      verdict: 'FRAUD',
      reason: 'AI detected mismatched bank account number and invalid transfer memo code. Flagged as fraudulent proof. Slashed 10% Security Deposit.',
    },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      const marketInfo = await readContract('get_market_info');
      const totalCount = Number(marketInfo?.total_orders || 0);

      const fetchedList: P2POrder[] = [];
      for (let i = 1; i <= totalCount; i++) {
        const ordData = await readContract('get_order', [String(i)]);
        if (ordData) {
          fetchedList.push({
            order_id: String(i),
            seller: String(ordData.seller || ''),
            buyer: String(ordData.buyer || ''),
            crypto_amount: String(ordData.crypto_amount || '0'),
            fiat_amount: Number(ordData.fiat_amount || 0),
            fiat_currency: String(ordData.fiat_currency || 'VND'),
            bank_name: String(ordData.bank_name || ''),
            bank_account: String(ordData.bank_account || ''),
            account_holder: String(ordData.account_holder || ''),
            ref_code: String(ordData.ref_code || ''),
            status: ordData.status || 'LISTED',
            buyer_deposit: String(ordData.buyer_deposit || '0'),
            proof_url: String(ordData.proof_url || ''),
            ai_verdict: ordData.ai_verdict || 'PENDING',
            ai_reason: String(ordData.ai_reason || ''),
          });
        }
      }
      setOrders(fetchedList);
    } catch (err) {
      console.error('Error fetching P2P orders:', err);
    }
  }, [readContract]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Run Interactive Demo Flow Simulation
  const runDemoSimulation = () => {
    setIsDemoRunning(true);
    setDemoStep(1);
    setTimeout(() => setDemoStep(2), 1500);
    setTimeout(() => setDemoStep(3), 3000);
    setTimeout(() => {
      setDemoStep(4);
      setIsDemoRunning(false);
    }, 4500);
  };

  // Initiate Buy with 10% Security Deposit
  const handleInitiateBuy = async (order: P2POrder) => {
    setSelectedOrder(order);
    const bondWei = (BigInt(order.crypto_amount) * 1000n) / 10000n; // 10% bond
    await writeContract(
      'initiate_buy_order',
      [order.order_id],
      bondWei,
      `Locking 10% Security Deposit (${bondWei} GEN) for Order #${order.order_id}...`
    );
    fetchOrders();
  };

  // Submit Bank Payment Proof for AI Release
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !proofUrl) return;

    const res = await writeContract(
      'submit_payment_proof',
      [selectedOrder.order_id, proofUrl],
      undefined,
      `GenLayer AI Consensus verifying bank proof & releasing escrow...`
    );

    if (res) {
      fetchOrders();
      setSelectedOrder(null);
      setProofUrl('');
    }
  };

  const copyMemo = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const currentDemo = sampleProofs[demoSelected];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live AI Auto-Release Ticker Banner */}
      <div className="gl-cyber-panel p-2.5 rounded-2xl border border-[#00F2FE]/30 bg-[#0B1120] overflow-hidden relative">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-[#00F2FE] text-[#050811] text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-md shadow-[#00F2FE]/20">
            <Zap className="w-3 h-3 fill-[#050811]" /> LIVE TICKER
          </span>
          <div className="overflow-hidden w-full relative">
            <div className="animate-ticker text-xs font-mono-data text-slate-300 gap-8">
              <span>⚡ Order #1: Auto-released 100 GEN to 0x7a... via Vietcombank (AI Match 99.8%)</span>
              <span>⚡ Order #2: Auto-released 250 GEN to 0x3b... via Moniepoint POS (AI Match 100%)</span>
              <span>⚠️ Order #3: Slashed 10% Security Deposit from 0x9c... (AI Flagged Tampered Receipt)</span>
              <span>⚡ Order #4: Auto-released 500 GEN to 0x1f... via Kuda Bank (AI Match 99.5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 4-Step AI Verification Demo Panel */}
      <div className="gl-cyber-panel p-6 md:p-8 rounded-3xl border border-[#00F2FE]/30 bg-gradient-to-r from-[#0B1120] via-[#0F172A] to-[#1E1B4B] space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F2FE]/10 text-[#38BDF8] text-xs font-mono-data font-bold border border-[#00F2FE]/30">
              <Cpu className="w-4 h-4 text-[#00F2FE] animate-pulse" /> GenLayer AI Bank Verification Simulator
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight">
              Interactive Demo: How AI Verifies & Releases Escrow
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test how GenLayer AI validator nodes fetch bank receipt data (`gl.nondet.web.render`), check account numbers & memo codes, and automatically release Crypto!
            </p>
          </div>

          <button
            onClick={runDemoSimulation}
            disabled={isDemoRunning}
            className="gl-btn-cyan px-6 py-3 text-xs font-black flex items-center gap-2 shrink-0 shadow-lg shadow-[#00F2FE]/25 disabled:opacity-50"
          >
            {isDemoRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> AI Consensus Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#050811]" /> Start Interactive AI Verification Demo
              </>
            )}
          </button>
        </div>

        {/* Demo Preset Selector */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 font-mono-data flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00F2FE]" /> Choose Demo Bank Receipt Scenario:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleProofs.map(sample => (
              <button
                key={sample.id}
                onClick={() => {
                  setDemoSelected(sample.id);
                  setDemoStep(0);
                }}
                className={`p-3.5 rounded-2xl border text-left text-xs transition-all ${
                  demoSelected === sample.id
                    ? 'border-[#00F2FE] bg-[#00F2FE]/15 text-white shadow-lg shadow-[#00F2FE]/10'
                    : 'border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-white text-xs mb-1">{sample.label}</div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold ${sample.badgeClass}`}>
                  {sample.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step-by-Step Interactive Process Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 font-mono-data">
          {/* Step 1 */}
          <div className={`p-4 rounded-2xl border transition-all ${demoStep >= 1 ? 'border-[#00F2FE] bg-[#00F2FE]/10 text-white' : 'border-white/10 bg-slate-950/40 text-slate-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 1: Receipt Upload</span>
              {demoStep >= 1 && <Check className="w-4 h-4 text-[#00F2FE]" />}
            </div>
            <div className="text-xs font-bold text-white">Upload Bank Proof</div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{currentDemo.url}</p>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-2xl border transition-all ${demoStep >= 2 ? 'border-[#00FF87] bg-[#00FF87]/10 text-white' : 'border-white/10 bg-slate-950/40 text-slate-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 2: AI Web Render</span>
              {demoStep >= 2 && <Check className="w-4 h-4 text-[#00FF87]" />}
            </div>
            <div className="text-xs font-bold text-white">gl.nondet.web.render</div>
            <p className="text-[11px] text-slate-400 mt-1">Extracted Account: {currentDemo.accountNumber}</p>
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-2xl border transition-all ${demoStep >= 3 ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-white/10 bg-slate-950/40 text-slate-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 3: AI Consensus</span>
              {demoStep >= 3 && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-xs font-bold text-white">Optimistic Democracy</div>
            <p className="text-[11px] text-slate-400 mt-1">Memo Match: {currentDemo.memo}</p>
          </div>

          {/* Step 4 */}
          <div className={`p-4 rounded-2xl border transition-all ${demoStep >= 4 ? (currentDemo.verdict === 'MATCHED' ? 'border-[#00FF87] bg-[#00FF87]/15 text-white' : 'border-[#FF3366] bg-[#FF3366]/15 text-white') : 'border-white/10 bg-slate-950/40 text-slate-500'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 4: Smart Execution</span>
              {demoStep >= 4 && (currentDemo.verdict === 'MATCHED' ? <CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> : <AlertTriangle className="w-4 h-4 text-[#FF3366]" />)}
            </div>
            <div className="text-xs font-bold text-white">
              {demoStep >= 4 ? (currentDemo.verdict === 'MATCHED' ? '✓ Auto-Released 100%' : '⚠️ 10% Bond Slashed!') : 'Awaiting Execution'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{currentDemo.reason}</p>
          </div>
        </div>
      </div>

      {/* Active P2P Sell Orders Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-[#00F2FE]" /> Active P2P Escrow Listings
          </h3>
          <span className="text-xs text-slate-400 font-mono-data bg-[#0F172A] px-3 py-1 rounded-xl border border-[#00F2FE]/20">
            Active Orders: {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="gl-cyber-panel p-14 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white font-display">No P2P Escrow Listings Found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                No active merchant sell orders on studionet. Switch to the <strong>Merchant Hub</strong> tab to create a sell order and lock GEN into escrow!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => {
              const cryptoVal = Number(order.crypto_amount);
              const bondVal = (cryptoVal * 0.1).toFixed(2);

              return (
                <div
                  key={order.order_id}
                  className="gl-cyber-panel gl-cyber-panel-interactive p-6 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="gl-badge-cyan px-3 py-1 rounded-xl text-xs font-bold font-mono-data">
                        Order #{order.order_id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider font-mono-data ${
                          order.status === 'LISTED'
                            ? 'gl-badge-cyan'
                            : order.status === 'COMPLETED'
                            ? 'gl-badge-emerald'
                            : order.status === 'DISPUTED_FRAUD'
                            ? 'gl-badge-rose'
                            : 'gl-badge-gold'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 font-medium">Escrowed Crypto Amount</div>
                      <div className="text-3xl font-black text-white font-mono-data tracking-tight">{order.crypto_amount} GEN</div>
                    </div>

                    {/* Bank Transfer Details Box */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 text-xs font-mono-data">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Required Fiat:</span>
                        <span className="font-extrabold text-amber-400 text-sm">
                          {order.fiat_amount.toLocaleString()} {order.fiat_currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 text-[11px]">
                        <span>Bank Name:</span>
                        <span className="text-white font-bold">{order.bank_name}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 text-[11px]">
                        <span>Required Memo Code:</span>
                        <span className="text-[#00FF87] font-black">{order.ref_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono-data">
                      <span>Buyer 10% Security Deposit:</span>
                      <span className="text-amber-400 font-extrabold">{bondVal} GEN</span>
                    </div>

                    {order.status === 'LISTED' && (
                      <button
                        onClick={() => handleInitiateBuy(order)}
                        className="gl-btn-cyan w-full py-3 text-xs flex items-center justify-center gap-2"
                      >
                        Initiate Trade & Deposit Bond <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {order.buyer.toLowerCase() === address.toLowerCase() &&
                      order.status === 'PENDING_BUYER_PROOF' && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="gl-btn-emerald w-full py-3 text-xs flex items-center justify-center gap-2"
                        >
                          Upload Receipt Proof for AI Release
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade & Bank Receipt Submission Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="gl-cyber-panel p-6 md:p-8 rounded-3xl border border-[#00F2FE]/40 max-w-xl w-full space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl font-black text-white font-display">Bank Payment & AI Release</h3>
                <p className="text-xs text-slate-400 font-mono-data">Order #{selectedOrder.order_id} • Escrowed: {selectedOrder.crypto_amount} GEN</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Bank Payment Transfer Details */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3.5 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider font-mono-data">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Transfer Fiat to Merchant Account
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono-data">
                <div>
                  <div className="text-[10px] text-slate-400">Bank Name</div>
                  <div className="font-bold text-white text-sm">{selectedOrder.bank_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Account Owner Name</div>
                  <div className="font-bold text-white text-sm">{selectedOrder.account_holder}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Account Number</div>
                  <div className="font-bold text-[#00FF87] text-sm">{selectedOrder.bank_account}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Amount Required</div>
                  <div className="font-bold text-amber-400 text-sm">{selectedOrder.fiat_amount.toLocaleString()} {selectedOrder.fiat_currency}</div>
                </div>
              </div>

              {/* Memo Reference Code Highlight */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-300 font-black uppercase">Required Transfer Memo Code</div>
                  <div className="text-base font-black text-white font-mono-data tracking-wider">{selectedOrder.ref_code}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyMemo(selectedOrder.ref_code)}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-500/30"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedMemo ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Proof Submission Form */}
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Bank Transfer Receipt / Verification URL
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://vcb.com.vn/verify?tx=..."
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white font-mono-data focus:outline-none focus:border-[#00F2FE] shadow-inner"
                  required
                />
              </div>

              {/* Quick Sample Presets */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" /> Click a Quick Preset Receipt for Demonstration:
                </div>
                <div className="space-y-2">
                  {sampleProofs.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => setProofUrl(sample.url)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                        proofUrl === sample.url
                          ? 'border-[#00F2FE] bg-[#00F2FE]/15 text-white shadow-md shadow-[#00F2FE]/10'
                          : 'border-white/10 bg-slate-950/50 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{sample.label}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono-data ${sample.badgeClass}`}>
                            {sample.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{sample.desc}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="gl-btn-cyan w-full py-3.5 text-xs font-black flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Submit Proof to GenLayer AI & Auto-Release Escrow
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
