import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, ShieldCheck, AlertOctagon, CheckCircle2, Copy, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
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

  // Preset Sample Bank Proofs for Instant Demonstration
  const sampleProofs = [
    {
      label: '🏦 Vietcombank E-Receipt (Valid Match)',
      url: 'https://vcb.com.vn/verify?tx=987654321',
      desc: 'Valid official Vietcombank E-Receipt link matching target account & memo.',
      type: 'valid',
    },
    {
      label: '💳 Moniepoint POS Slip (Valid Match)',
      url: 'https://moniepoint.com/receipt/MP-998877',
      desc: 'Valid POS digital receipt matching transfer amount and reference code.',
      type: 'valid',
    },
    {
      label: '⚠️ Tampered / Fake Receipt (Triggers 10% Slash)',
      url: 'https://fake-receipts.com/tampered-slip.png',
      desc: 'Invalid or photoshopped receipt URL. AI flags FRAUD and slashes 10% deposit.',
      type: 'fraud',
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

    await writeContract(
      'submit_payment_proof',
      [selectedOrder.order_id, proofUrl],
      undefined,
      `GenLayer AI Consensus verifying bank proof & releasing escrow...`
    );
    fetchOrders();
    setSelectedOrder(null);
    setProofUrl('');
  };

  const copyMemo = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner / Info Header */}
      <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-purple-950/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Instant AI Bank Proof Verification
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display">
              Buy Crypto with Fiat (P2P Escrow)
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pay via Bank Transfer, upload your payment receipt URL, and GenLayer AI validators will verify transaction details to <strong>instantly release escrowed Crypto</strong> to your wallet.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 shrink-0 font-mono-data text-xs">
            <div className="text-slate-400 flex items-center justify-between gap-4">
              <span>Security Bond Ratio:</span>
              <span className="text-amber-400 font-bold">10% Deposit</span>
            </div>
            <div className="text-slate-400 flex items-center justify-between gap-4">
              <span>Protection Mechanism:</span>
              <span className="text-emerald-400 font-bold">Dual Anti-Fraud Escrow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active P2P Sell Orders Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" /> Active P2P Escrow Listings
          </h3>
          <span className="text-xs text-slate-400 font-mono-data">Total Orders: {orders.length}</span>
        </div>

        {orders.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <AlertOctagon className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">No P2P Listings Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No merchant sell orders available on studionet. Switch to the <strong>Merchant Escrow Hub</strong> tab to create a new sell order!
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
                  className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold font-mono-data border border-emerald-500/20">
                        Order #{order.order_id}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono-data ${
                          order.status === 'LISTED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : order.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : order.status === 'DISPUTED_FRAUD'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400">Escrowed Crypto</div>
                      <div className="text-2xl font-black text-white font-mono-data">{order.crypto_amount} GEN</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5 text-xs font-mono-data">
                      <div className="flex justify-between text-slate-300">
                        <span>Required Fiat:</span>
                        <span className="font-bold text-amber-400">
                          {order.fiat_amount.toLocaleString()} {order.fiat_currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Bank:</span>
                        <span className="text-white">{order.bank_name}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Required Memo Code:</span>
                        <span className="text-emerald-400 font-bold">{order.ref_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Buyer 10% Security Bond:</span>
                      <span className="text-amber-400 font-bold font-mono-data">{bondVal} GEN</span>
                    </div>

                    {order.status === 'LISTED' && (
                      <button
                        onClick={() => handleInitiateBuy(order)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        Initiate Trade & Deposit Bond <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {order.buyer.toLowerCase() === address.toLowerCase() &&
                      order.status === 'PENDING_BUYER_PROOF' && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-emerald-500/30 max-w-xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Bank Payment & AI Release</h3>
                <p className="text-xs text-slate-400">Order #{selectedOrder.order_id} • Escrowed: {selectedOrder.crypto_amount} GEN</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Bank Payment Transfer Details */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Transfer Fiat to Merchant Account
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono-data">
                <div>
                  <div className="text-[10px] text-slate-400">Bank Name</div>
                  <div className="font-bold text-white">{selectedOrder.bank_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Account Owner</div>
                  <div className="font-bold text-white">{selectedOrder.account_holder}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Account Number</div>
                  <div className="font-bold text-emerald-400">{selectedOrder.bank_account}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Amount Required</div>
                  <div className="font-bold text-amber-400">{selectedOrder.fiat_amount.toLocaleString()} {selectedOrder.fiat_currency}</div>
                </div>
              </div>

              {/* Memo Reference Code Highlight */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-300 font-bold uppercase">Required Transfer Memo Code</div>
                  <div className="text-sm font-black text-white font-mono-data">{selectedOrder.ref_code}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyMemo(selectedOrder.ref_code)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedMemo ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Proof Submission Form */}
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bank Transfer Receipt / Verification URL
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://vcb.com.vn/verify?tx=..."
                  className="w-full bg-dark-base/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Quick Sample Presets */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Quick Preset Receipts for Demo:
                </div>
                <div className="space-y-1.5">
                  {sampleProofs.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProofUrl(sample.url)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        proofUrl === sample.url
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white text-[11px]">{sample.label}</div>
                        <div className="text-[10px] text-slate-400">{sample.desc}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
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
