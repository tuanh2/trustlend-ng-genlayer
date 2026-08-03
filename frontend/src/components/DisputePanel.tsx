import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, FileCheck } from 'lucide-react';
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="min-card p-8 space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Audit & Verification Logs
          </h1>
          <p className="text-xs text-[#9CA3AF]">
            Transparent audit logs of bank payment verification, optimistic consensus verdicts, and security bond slash records.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          placeholder="Search Order ID or Memo Code..."
          className="w-full bg-[#0E0F12] border border-[#1F2026] rounded-lg pl-9 pr-4 py-2 text-xs text-white font-mono-data focus:outline-none"
        />
      </div>

      {/* Audit Logs List */}
      <div className="space-y-3 font-mono-data">
        {filteredOrders.length === 0 ? (
          <div className="min-card p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-[#6B7280] mx-auto" />
            <div className="text-sm font-semibold text-white">No Audit Logs Available</div>
            <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
              Submit payment proof on active trades to generate live consensus verification logs.
            </p>
          </div>
        ) : (
          filteredOrders.map(ord => (
            <div key={ord.order_id} className="min-card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white">Order #{ord.order_id}</span>
                  <span className="text-xs text-[#9CA3AF]">Memo: <span className="text-[#F59E0B] font-bold">{ord.ref_code}</span></span>
                  <span className="text-xs text-[#9CA3AF]">{ord.fiat_amount.toLocaleString()} {ord.fiat_currency} ({ord.crypto_amount} GEN)</span>
                </div>

                <span className={`px-3 py-1 rounded text-xs font-semibold ${ord.ai_verdict === 'MATCHED' ? 'min-badge-emerald' : 'min-badge-red'}`}>
                  Verdict: {ord.ai_verdict}
                </span>
              </div>

              <div className="min-card-inset p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#F59E0B] font-semibold">
                  <FileCheck className="w-3.5 h-3.5" /> Verification Summary:
                </div>
                <div className="text-[#E5E7EB]">{ord.ai_reason}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
