import React, { useState } from 'react';
import { DollarSign, Zap, CheckCircle2, AlertTriangle, Play, Key, RefreshCw, FileCheck } from 'lucide-react';
import type { CEXConnection, CEXOrder } from '../types';
import { playSuccessChime } from '../utils/audio';

interface MerchantHubProps {
  address: string;
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const LenderDashboard: React.FC<MerchantHubProps> = () => {
  const [cexList, setCexList] = useState<CEXConnection[]>([
    { id: 'binance', name: 'Binance P2P', logo: '🟡', connected: true, apiKey: 'bn_live_9f82...3a1e', todayVolumeUsdt: 6850, todayOrderCount: 27 },
    { id: 'okx', name: 'OKX P2P', logo: '⬛', connected: true, apiKey: 'okx_live_4b77...8c99', todayVolumeUsdt: 4200, todayOrderCount: 16 },
    { id: 'bybit', name: 'Bybit P2P', logo: '🟧', connected: true, apiKey: 'bybit_live_11a8...55f2', todayVolumeUsdt: 2600, todayOrderCount: 11 },
    { id: 'mexc', name: 'MEXC P2P', logo: '🟢', connected: false, apiKey: 'mexc_test_0000...0000', todayVolumeUsdt: 1200, todayOrderCount: 4 },
  ]);

  const [cexOrders, setCexOrders] = useState<CEXOrder[]>([
    {
      id: 'CEX-BN-9921',
      exchange: 'Binance P2P',
      pair: 'USDT/VND',
      cryptoAmount: 100,
      fiatAmount: 2540000,
      currency: 'VND',
      buyerName: 'NGUYEN VAN A',
      bankName: 'Vietcombank',
      accountNumber: '9988776655',
      refCode: 'TLENG-88F3A',
      status: 'COMPLETED_AUTO',
      aiScore: 99.8,
      timestamp: '19:14:02',
      aiReason: 'Verified Vietcombank transfer 2,540,000 VND to account 9988776655. Released on Binance API.',
    },
    {
      id: 'CEX-OKX-8842',
      exchange: 'OKX P2P',
      pair: 'USDT/VND',
      cryptoAmount: 250,
      fiatAmount: 6350000,
      currency: 'VND',
      buyerName: 'TRAN THI B',
      bankName: 'Techcombank',
      accountNumber: '1903887766',
      refCode: 'TLENG-44E91',
      status: 'COMPLETED_AUTO',
      aiScore: 100,
      timestamp: '19:10:45',
      aiReason: 'Verified Techcombank digital receipt. 6,350,000 VND received. Released 250 USDT.',
    },
    {
      id: 'CEX-BYBIT-3310',
      exchange: 'Bybit P2P',
      pair: 'USDT/VND',
      cryptoAmount: 500,
      fiatAmount: 12700000,
      currency: 'VND',
      buyerName: 'LE HOANG C',
      bankName: 'MBBank',
      accountNumber: '00011223344',
      refCode: 'TLENG-99C12',
      status: 'NEEDS_REVIEW',
      aiScore: 45.2,
      timestamp: '18:58:12',
      aiReason: '⚠️ Mismatched account holder name on payment proof. Flagged for merchant review.',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPLETED_AUTO' | 'NEEDS_REVIEW' | 'FRAUD_BLOCKED'>('ALL');
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);

  const simulateIncomingCEXOrder = () => {
    setIsSimulatingOrder(true);
    const newId = `CEX-BN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRef = `TLENG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    setTimeout(() => {
      const newOrd: CEXOrder = {
        id: newId,
        exchange: 'Binance P2P',
        pair: 'USDT/VND',
        cryptoAmount: 100,
        fiatAmount: 2540000,
        currency: 'VND',
        buyerName: 'VO VAN D',
        bankName: 'Vietcombank',
        accountNumber: '9988776655',
        refCode: newRef,
        status: 'COMPLETED_AUTO',
        aiScore: 99.9,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        aiReason: `Scanned Vietcombank E-Receipt. 2,540,000 VND received for memo ${newRef}. Released 100 USDT on Binance API.`,
      };

      setCexOrders(prev => [newOrd, ...prev]);
      setIsSimulatingOrder(false);
      playSuccessChime();
    }, 2000);
  };

  const toggleCexConnection = (id: string) => {
    setCexList(prev =>
      prev.map(c => (c.id === id ? { ...c, connected: !c.connected } : c))
    );
  };

  const filteredCexOrders = activeFilter === 'ALL'
    ? cexOrders
    : cexOrders.filter(o => o.status === activeFilter);

  const totalUsdtToday = cexOrders.reduce((sum, o) => sum + (o.status === 'COMPLETED_AUTO' ? o.cryptoAmount : 0), 0);
  const totalVndToday = totalUsdtToday * 25400;
  const autoCompletedCount = cexOrders.filter(o => o.status === 'COMPLETED_AUTO').length;
  const needsReviewCount = cexOrders.filter(o => o.status === 'NEEDS_REVIEW').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="min-card p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Merchant P2P Escrow Hub
            </h1>
            <p className="text-xs text-[#9CA3AF]">
              Connect Binance, OKX, Bybit & MEXC P2P APIs. Automated real-time payment verification and instant crypto release.
            </p>
          </div>

          <button
            onClick={simulateIncomingCEXOrder}
            disabled={isSimulatingOrder}
            className="min-btn-primary px-5 py-2.5 text-xs flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSimulatingOrder ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Receiving Order...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" /> ⚡ Simulate 100 USDT Order
              </>
            )}
          </button>
        </div>

        {/* CEX Badges */}
        <div className="space-y-2 pt-2 border-t border-[#1F2026] font-mono-data">
          <div className="text-xs text-[#9CA3AF] flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-[#F59E0B]" /> Exchange APIs:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cexList.map(cex => (
              <div
                key={cex.id}
                onClick={() => toggleCexConnection(cex.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  cex.connected
                    ? 'border-[#F59E0B] bg-[#141519] text-white'
                    : 'border-[#1F2026] bg-[#050507] text-[#6B7280]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cex.logo}</span>
                  <div>
                    <div className="font-semibold text-white text-xs">{cex.name}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{cex.connected ? 'Active' : 'Offline'}</div>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${cex.connected ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="min-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#141519] border border-[#1F2026] text-[#F59E0B] flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#9CA3AF]">Sales Volume Today</div>
            <div className="text-xl font-bold text-white font-mono-data">${totalUsdtToday.toLocaleString()} USDT</div>
            <div className="text-[10px] text-[#10B981] font-mono-data">≈ {totalVndToday.toLocaleString()} VND</div>
          </div>
        </div>

        <div className="min-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#141519] border border-[#1F2026] text-[#10B981] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#9CA3AF]">Auto-Released Trades</div>
            <div className="text-xl font-bold text-[#10B981] font-mono-data">{autoCompletedCount} Orders</div>
            <div className="text-[10px] text-[#9CA3AF] font-mono-data">100% Automated</div>
          </div>
        </div>

        <div className="min-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#141519] border border-[#1F2026] text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#9CA3AF]">Manual Review Flagged</div>
            <div className="text-xl font-bold text-amber-400 font-mono-data">{needsReviewCount} Order</div>
            <div className="text-[10px] text-[#9CA3AF] font-mono-data">Mismatched Slip</div>
          </div>
        </div>
      </div>

      {/* Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F59E0B]" /> Real-Time P2P Stream
          </h2>

          <div className="flex items-center gap-1 bg-[#0E0F12] p-1 rounded-lg border border-[#1F2026] font-mono-data text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${activeFilter === 'ALL' ? 'bg-[#1F2026] text-white font-semibold' : 'text-[#9CA3AF]'}`}
            >
              All ({cexOrders.length})
            </button>
            <button
              onClick={() => setActiveFilter('COMPLETED_AUTO')}
              className={`px-3 py-1 rounded-md transition-all ${activeFilter === 'COMPLETED_AUTO' ? 'bg-[#10B981] text-black font-semibold' : 'text-[#9CA3AF]'}`}
            >
              Auto-Released ({autoCompletedCount})
            </button>
          </div>
        </div>

        <div className="space-y-3 font-mono-data">
          {filteredCexOrders.map(ord => (
            <div key={ord.id} className="min-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="min-badge-amber px-2 py-0.5 rounded text-xs font-semibold">{ord.exchange}</span>
                  <span className="text-sm font-bold text-white">{ord.id}</span>
                  <span className="text-xs text-[#10B981] font-bold">{ord.cryptoAmount} USDT</span>
                  <span className="text-xs text-[#9CA3AF]">• {ord.fiatAmount.toLocaleString()} {ord.currency}</span>
                </div>

                <div className="text-xs text-[#9CA3AF]">
                  Buyer: <span className="text-white">{ord.buyerName}</span> • Bank: <span className="text-white">{ord.bankName}</span> • Memo: <span className="text-[#F59E0B]">{ord.refCode}</span>
                </div>

                <div className="text-[11px] text-[#9CA3AF] min-card-inset p-2 flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  <span>{ord.aiReason}</span>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                <span className={`px-3 py-1 rounded text-xs font-semibold ${ord.status === 'COMPLETED_AUTO' ? 'min-badge-emerald' : 'min-badge-amber'}`}>
                  {ord.status === 'COMPLETED_AUTO' ? '✓ Released' : '⚠️ Review'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
