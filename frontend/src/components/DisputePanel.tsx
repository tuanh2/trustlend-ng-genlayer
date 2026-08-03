import React, { useState, useEffect, useCallback } from 'react';
import { Gavel, ShieldAlert, Sparkles, CheckCircle2, FileText, Search } from 'lucide-react';
import type { P2POrder } from '../types';

interface DisputeCenterProps {
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const DisputePanel: React.FC<DisputeCenterProps> = ({
  readContract,
}) => {
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [searchId, setSearchId] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const marketInfo = await readContract('get_market_info');
      const totalCount = Number(marketInfo?.total_orders || 0);

      const fetchedList: P2POrder[] = [];
      for (let i = 1; i <= totalCount; i++) {
        const ordData = await readContract('get_order', [String(i)]);
        if (ordData && ordData.ai_verdict !== 'PENDING') {
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
      console.error('Error fetching audit logs:', err);
    }
  }, [readContract]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = searchId
    ? orders.filter(o => o.order_id === searchId || o.ref_code.includes(searchId.toUpperCase()))
    : orders;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="ks-panel p-6 md:p-8 rounded-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-500/10 text-purple-300 text-xs font-mono-data font-bold border border-purple-500/30">
              <Gavel className="w-3.5 h-3.5" /> Subjective Consensus Court
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
              AI Verification Audit & Anti-Fraud Logs
            </h2>
            <p className="text-xs text-[#E2E8F0] leading-relaxed">
              Transparent, immutable record of GenLayer AI Validator decisions. Review verification prompts, bank receipt audit trails, and 10% Security Deposit slash penalties.
            </p>
          </div>

          <div className="p-4 rounded bg-[#050607] border border-[#F5C842]/20 space-y-2 shrink-0 font-mono-data text-xs">
            <div className="text-[#94A3B8] flex items-center justify-between gap-4">
              <span>Audited Trades:</span>
              <span className="text-[#F5C842] font-bold">{orders.length} Logs</span>
            </div>
            <div className="text-[#94A3B8] flex items-center justify-between gap-4">
              <span>Consensus Engine:</span>
              <span className="text-[#14B8A6] font-bold">Optimistic Democracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Search by Order ID or Memo Ref Code (e.g. TLENG)..."
            className="w-full bg-[#050607] border border-[#F5C842]/20 rounded pl-9 pr-4 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#F5C842]"
          />
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="ks-panel p-12 rounded text-center space-y-3">
            <FileText className="w-10 h-10 text-[#64748B] mx-auto" />
            <h4 className="text-lg font-bold text-white font-display">No AI Audit Logs Available</h4>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
              Submit payment proof on an active trade in the P2P Escrow Market to generate live AI validator verification logs!
            </p>
          </div>
        ) : (
          filteredOrders.map(ord => (
            <div
              key={ord.order_id}
              className="ks-panel p-6 rounded space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 font-mono-data">
                  <span className="px-3 py-1 rounded bg-[#050607] text-[#E2E8F0] text-xs font-bold border border-white/10">
                    Order #{ord.order_id}
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    Memo: <span className="text-[#F5C842] font-bold">{ord.ref_code}</span>
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    Amount: <span className="text-white font-bold">{ord.fiat_amount.toLocaleString()} {ord.fiat_currency}</span> ({ord.crypto_amount} GEN)
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono-data">
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-1.5 ${
                      ord.ai_verdict === 'MATCHED'
                        ? 'ks-badge-patina'
                        : ord.ai_verdict === 'FRAUD'
                        ? 'ks-badge-vermilion'
                        : 'ks-badge-gold'
                    }`}
                  >
                    {ord.ai_verdict === 'MATCHED' && <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />}
                    {ord.ai_verdict === 'FRAUD' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                    AI Verdict: {ord.ai_verdict}
                  </span>
                </div>
              </div>

              {/* Reasoning Callout Box */}
              <div className="p-4 rounded bg-[#050607] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#F5C842] font-bold">
                  <Sparkles className="w-4 h-4 text-[#F5C842]" /> AI Validator Consensus Explanation:
                </div>
                <p className="text-[#E2E8F0] font-mono-data leading-relaxed bg-[#121417] p-3 rounded border border-white/5">
                  "{ord.ai_reason}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 font-mono-data">
                  <span>Proof URL: {ord.proof_url}</span>
                  <span>{ord.ai_verdict === 'FRAUD' ? '⚠️ 10% Security Deposit Slashed to Seller' : '✓ Escrow Auto-Released to Buyer'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
