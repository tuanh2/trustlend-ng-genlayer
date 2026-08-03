import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, ShieldCheck, AlertOctagon, CheckCircle2, Copy, Sparkles, ExternalLink, ArrowRight, Zap, Clock } from 'lucide-react';
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
  const [simStep, setSimStep] = useState<number | null>(null);

  // Preset Sample Bank Proofs for Instant Demonstration
  const sampleProofs = [
    {
      label: '🏦 Vietcombank E-Receipt (Valid Match)',
      url: 'https://vcb.com.vn/verify?tx=987654321',
      desc: 'Official Vietcombank receipt link matching account, amount & memo TLENG-88F3A.',
      badge: '99.8% AI Match',
      badgeClass: 'ks-badge-patina',
    },
    {
      label: '💳 Moniepoint POS Digital Receipt (Valid Match)',
      url: 'https://moniepoint.com/receipt/MP-998877',
      desc: 'Valid digital POS receipt matching transfer amount and reference code.',
      badge: '100% Verified',
      badgeClass: 'ks-badge-patina',
    },
    {
      label: '⚠️ Tampered / Fake Receipt (Triggers 10% Slash)',
      url: 'https://fake-receipts.com/tampered-slip.png',
      desc: 'Invalid or photoshopped receipt URL. GenLayer AI flags FRAUD and slashes deposit.',
      badge: 'FRAUD - Slashed',
      badgeClass: 'ks-badge-vermilion',
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

    // Simulate AI Consensus Step Progress Visualizer
    setSimStep(1);
    setTimeout(() => setSimStep(2), 1500);
    setTimeout(() => setSimStep(3), 3000);

    const res = await writeContract(
      'submit_payment_proof',
      [selectedOrder.order_id, proofUrl],
      undefined,
      `GenLayer AI Consensus verifying bank proof & releasing escrow...`
    );

    setSimStep(null);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live AI Auto-Release Ticker Banner */}
      <div className="ks-panel-deep p-2 rounded border border-[#14B8A6]/30 overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="ks-badge-patina px-2 py-0.5 text-[10px] font-mono-data font-bold uppercase shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#14B8A6]" /> LIVE TICKER
          </span>
          <div className="overflow-hidden w-full relative">
            <div className="animate-ticker text-xs font-mono-data text-[#E2E8F0] gap-8">
              <span>⚡ Order #1: Auto-released 100 GEN to 0x7a... via Vietcombank (AI Match 99.8%)</span>
              <span>⚡ Order #2: Auto-released 250 GEN to 0x3b... via Moniepoint POS (AI Match 100%)</span>
              <span>⚠️ Order #3: Slashed 10% Security Deposit from 0x9c... (AI Flagged Tampered Receipt)</span>
              <span>⚡ Order #4: Auto-released 500 GEN to 0x1f... via Kuda Bank (AI Match 99.5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="ks-panel p-6 md:p-8 rounded-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F5C842]/10 text-[#F5C842] text-xs font-mono-data font-bold border border-[#F5C842]/30">
              <Sparkles className="w-4 h-4 text-[#F5C842]" /> Oracle-Free AI Escrow Consensus
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight leading-tight">
              Buy Crypto with Fiat <br />
              <span className="text-[#F5C842]">Instant AI Auto-Release</span>
            </h2>
            <p className="text-xs md:text-sm text-[#E2E8F0] leading-relaxed">
              Pay via Bank Transfer, upload your payment receipt URL, and GenLayer AI validators will inspect transaction details on-chain to <strong>instantly release escrowed Crypto</strong> with 10% Security Deposit protection.
            </p>
          </div>

          {/* Quick Metrics Badge Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-4 rounded bg-[#050607] border border-[#F5C842]/20 space-y-1">
              <div className="text-[11px] text-[#94A3B8] font-mono-data">Security Deposit</div>
              <div className="text-xl font-bold text-[#F5C842] font-mono-data">10% Bond</div>
              <div className="text-[10px] text-[#64748B]">Anti-Fraud Protected</div>
            </div>

            <div className="p-4 rounded bg-[#050607] border border-[#14B8A6]/20 space-y-1">
              <div className="text-[11px] text-[#94A3B8] font-mono-data">Release Time</div>
              <div className="text-xl font-bold text-[#14B8A6] font-mono-data">~5 Seconds</div>
              <div className="text-[10px] text-[#64748B]">Zero Seller Wait</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active P2P Sell Orders Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#F5C842]" /> Active P2P Escrow Listings
          </h3>
          <span className="text-xs text-[#94A3B8] font-mono-data bg-[#121417] px-3 py-1 rounded border border-[#F5C842]/20">
            Active Orders: {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="ks-panel p-12 rounded text-center space-y-3">
            <AlertOctagon className="w-10 h-10 text-[#F5C842] mx-auto" />
            <h4 className="text-lg font-bold text-white">No P2P Escrow Listings Found</h4>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              No active merchant sell orders on studionet. Switch to the <strong>Merchant Hub</strong> tab to create a sell order and lock GEN into escrow!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => {
              const cryptoVal = Number(order.crypto_amount);
              const bondVal = (cryptoVal * 0.1).toFixed(2);

              return (
                <div
                  key={order.order_id}
                  className="ks-panel ks-panel-interactive p-6 rounded space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="ks-badge-gold px-2.5 py-0.5 text-xs font-mono-data font-bold rounded">
                        Order #{order.order_id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono-data font-bold uppercase tracking-wider ${
                          order.status === 'LISTED'
                            ? 'ks-badge-patina'
                            : order.status === 'COMPLETED'
                            ? 'ks-badge-gold'
                            : order.status === 'DISPUTED_FRAUD'
                            ? 'ks-badge-vermilion'
                            : 'bg-[#21252B] text-white'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-[#94A3B8]">Escrowed Crypto Amount</div>
                      <div className="text-3xl font-black text-white font-mono-data">{order.crypto_amount} GEN</div>
                    </div>

                    {/* Bank Transfer Details Box */}
                    <div className="p-3.5 rounded bg-[#050607] border border-white/10 space-y-1.5 text-xs font-mono-data">
                      <div className="flex justify-between items-center text-[#E2E8F0]">
                        <span className="text-[#94A3B8]">Required Fiat:</span>
                        <span className="font-bold text-[#F5C842] text-sm">
                          {order.fiat_amount.toLocaleString()} {order.fiat_currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#94A3B8] text-[11px]">
                        <span>Bank Name:</span>
                        <span className="text-white font-bold">{order.bank_name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#94A3B8] text-[11px]">
                        <span>Required Memo Code:</span>
                        <span className="text-[#14B8A6] font-bold">{order.ref_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[#F5C842]/15">
                    <div className="text-[11px] text-[#94A3B8] flex items-center justify-between font-mono-data">
                      <span>Buyer 10% Security Deposit:</span>
                      <span className="text-[#F5C842] font-bold">{bondVal} GEN</span>
                    </div>

                    {order.status === 'LISTED' && (
                      <button
                        onClick={() => handleInitiateBuy(order)}
                        className="ks-button-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                      >
                        Initiate Trade & Deposit Bond <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {order.buyer.toLowerCase() === address.toLowerCase() &&
                      order.status === 'PENDING_BUYER_PROOF' && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="ks-button-patina w-full py-2.5 text-xs flex items-center justify-center gap-2"
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
          <div className="ks-panel p-6 md:p-8 rounded-lg border border-[#F5C842]/40 max-w-xl w-full space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white font-display">Bank Payment & AI Release</h3>
                <p className="text-xs text-[#94A3B8] font-mono-data">Order #{selectedOrder.order_id} • Escrowed: {selectedOrder.crypto_amount} GEN</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded bg-[#121417] border border-white/10 text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Bank Payment Transfer Details */}
            <div className="p-4 rounded bg-[#050607] border border-[#F5C842]/30 space-y-3 font-mono-data">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5C842] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Transfer Fiat to Merchant Account
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-[#94A3B8]">Bank Name</div>
                  <div className="font-bold text-white text-sm">{selectedOrder.bank_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#94A3B8]">Account Owner Name</div>
                  <div className="font-bold text-white text-sm">{selectedOrder.account_holder}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#94A3B8]">Account Number</div>
                  <div className="font-bold text-[#14B8A6] text-sm">{selectedOrder.bank_account}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#94A3B8]">Amount Required</div>
                  <div className="font-bold text-[#F5C842] text-sm">{selectedOrder.fiat_amount.toLocaleString()} {selectedOrder.fiat_currency}</div>
                </div>
              </div>

              {/* Memo Reference Code Highlight */}
              <div className="p-3 rounded bg-[#F5C842]/10 border border-[#F5C842]/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#F5C842] font-bold uppercase">Required Transfer Memo Code</div>
                  <div className="text-base font-bold text-white tracking-wider">{selectedOrder.ref_code}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyMemo(selectedOrder.ref_code)}
                  className="ks-button-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedMemo ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Proof Submission Form */}
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5">
                  Bank Transfer Receipt / Verification URL
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://vcb.com.vn/verify?tx=..."
                  className="w-full bg-[#050607] border border-[#F5C842]/30 rounded px-4 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-[#F5C842]"
                  required
                />
              </div>

              {/* Quick Sample Presets */}
              <div className="space-y-2">
                <div className="text-[11px] text-[#94A3B8] font-mono-data flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5C842]" /> Click a Quick Preset Receipt for Demonstration:
                </div>
                <div className="space-y-2">
                  {sampleProofs.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProofUrl(sample.url)}
                      className={`w-full text-left p-3 rounded border text-xs transition-all flex items-center justify-between ${
                        proofUrl === sample.url
                          ? 'border-[#F5C842] bg-[#F5C842]/10 text-white'
                          : 'border-white/10 bg-[#050607] text-[#94A3B8] hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{sample.label}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold ${sample.badgeClass}`}>
                            {sample.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">{sample.desc}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#64748B] shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Progress Animation */}
              {simStep && (
                <div className="p-4 rounded bg-[#050607] border border-[#14B8A6]/30 space-y-2 text-xs font-mono-data">
                  <div className="flex items-center gap-2 text-[#14B8A6] font-bold">
                    <Clock className="w-4 h-4 animate-spin text-[#14B8A6]" /> GenLayer AI Validator Consensus Running...
                  </div>
                  <div className="space-y-1 text-[11px] text-[#E2E8F0]">
                    <p className={simStep >= 1 ? 'text-[#14B8A6] font-bold' : 'text-[#64748B]'}>
                      {simStep >= 1 ? '✓ Step 1: Rendered receipt URL content via gl.nondet.web.render' : '○ Step 1: Rendering receipt...'}
                    </p>
                    <p className={simStep >= 2 ? 'text-[#14B8A6] font-bold' : 'text-[#64748B]'}>
                      {simStep >= 2 ? '✓ Step 2: Validated Bank Account & Ref Code match' : '○ Step 2: Matching memo code...'}
                    </p>
                    <p className={simStep >= 3 ? 'text-[#14B8A6] font-bold' : 'text-[#64748B]'}>
                      {simStep >= 3 ? '✓ Step 3: Optimistic Democracy Consensus reached: MATCHED' : '○ Step 3: Reaching LLM consensus...'}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="ks-button-primary w-full py-3.5 text-xs flex items-center justify-center gap-2"
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
