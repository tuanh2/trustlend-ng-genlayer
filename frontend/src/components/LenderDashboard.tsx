import React, { useState } from 'react';
import { ShieldCheck, DollarSign, Bot, Zap, CheckCircle2, AlertTriangle, Cpu, Play, Key, RefreshCw } from 'lucide-react';
import type { CEXConnection, CEXOrder } from '../types';
import { playSuccessChime } from '../utils/audio';

interface MerchantHubProps {
  address: string;
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const LenderDashboard: React.FC<MerchantHubProps> = () => {
  // CEX API Connections
  const [cexList, setCexList] = useState<CEXConnection[]>([
    { id: 'binance', name: 'Binance P2P', logo: '🟡', connected: true, apiKey: 'bn_live_9f82...3a1e', todayVolumeUsdt: 6850, todayOrderCount: 27 },
    { id: 'okx', name: 'OKX P2P', logo: '⬛', connected: true, apiKey: 'okx_live_4b77...8c99', todayVolumeUsdt: 4200, todayOrderCount: 16 },
    { id: 'bybit', name: 'Bybit P2P', logo: '🟧', connected: true, apiKey: 'bybit_live_11a8...55f2', todayVolumeUsdt: 2600, todayOrderCount: 11 },
    { id: 'mexc', name: 'MEXC P2P', logo: '🟢', connected: false, apiKey: 'mexc_test_0000...0000', todayVolumeUsdt: 1200, todayOrderCount: 4 },
  ]);

  // CEX Orders Stream State
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
      aiReason: 'AI matched Vietcombank transfer 2,540,000 VND to account 9988776655 with memo TLENG-88F3A. Auto-released on Binance API.',
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
      aiReason: 'AI matched Techcombank digital receipt. 6,350,000 VND received. Auto-released 250 USDT.',
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
      aiReason: '⚠️ AI Alert: Mismatched account holder name on payment proof slip. Flagged for manual merchant verification.',
    },
    {
      id: 'CEX-BN-9890',
      exchange: 'Binance P2P',
      pair: 'USDT/VND',
      cryptoAmount: 300,
      fiatAmount: 7620000,
      currency: 'VND',
      buyerName: 'PHAM MINH D',
      bankName: 'Vietcombank',
      accountNumber: '9988776655',
      refCode: 'TLENG-11B34',
      status: 'COMPLETED_AUTO',
      aiScore: 99.5,
      timestamp: '18:45:30',
      aiReason: 'AI matched Vietcombank receipt 7,620,000 VND. Auto-released 300 USDT on Binance API.',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPLETED_AUTO' | 'NEEDS_REVIEW' | 'FRAUD_BLOCKED'>('ALL');
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);

  // Simulate Incoming CEX Order (e.g. 100 USDT on Binance P2P)
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
        aiReason: `AI scanned Vietcombank E-Receipt. 2,540,000 VND received for memo ${newRef}. Auto-released 100 USDT on Binance P2P API.`,
      };

      setCexOrders(prev => [newOrd, ...prev]);
      setIsSimulatingOrder(false);
      playSuccessChime(); // Play Ting-Ting sound!
    }, 2000);
  };

  const toggleCexConnection = (id: string) => {
    setCexList(prev =>
      prev.map(c => (c.id === id ? { ...c, connected: !c.connected } : c))
    );
  };

  // Filtered Orders
  const filteredCexOrders = activeFilter === 'ALL'
    ? cexOrders
    : cexOrders.filter(o => o.status === activeFilter);

  const totalUsdtToday = cexOrders.reduce((sum, o) => sum + (o.status === 'COMPLETED_AUTO' ? o.cryptoAmount : 0), 0);
  const totalVndToday = totalUsdtToday * 25400;
  const autoCompletedCount = cexOrders.filter(o => o.status === 'COMPLETED_AUTO').length;
  const needsReviewCount = cexOrders.filter(o => o.status === 'NEEDS_REVIEW').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Merchant AI Auto-Bot Header Banner */}
      <div className="ks-panel p-6 md:p-8 rounded-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#F5C842]/10 text-[#F5C842] text-xs font-mono-data font-medium border border-[#F5C842]/25">
              <Bot className="w-4 h-4 text-[#F5C842]" /> Merchant AI Auto-Release Bot Hub
            </div>
            <h1 className="text-3xl md:text-4xl text-white font-light tracking-tight">
              CEX Multi-Exchange P2P Auto-Seller Bot
            </h1>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Connect your Binance, OKX, Bybit & MEXC P2P API keys. GenLayer AI automatically verifies buyer bank payments in real-time and releases USDT/Crypto <strong>without any seller manual effort!</strong>
            </p>
          </div>

          <button
            onClick={simulateIncomingCEXOrder}
            disabled={isSimulatingOrder}
            className="ks-button-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSimulatingOrder ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Receiving CEX Order...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-[#090A0D]" /> ⚡ Simulate Incoming Binance 100 USDT Order
              </>
            )}
          </button>
        </div>

        {/* CEX API Connection Badges */}
        <div className="space-y-2 pt-2 border-t border-[#F5C842]/16 font-mono-data">
          <div className="text-xs font-medium text-[#9CA3AF] flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-[#F5C842]" /> Connected Exchange P2P APIs:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cexList.map(cex => (
              <div
                key={cex.id}
                onClick={() => toggleCexConnection(cex.id)}
                className={`p-3 rounded-xs border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  cex.connected
                    ? 'border-[#F5C842]/40 bg-[#F5C842]/10 text-white'
                    : 'border-white/10 bg-[#040507] text-[#6B7280] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cex.logo}</span>
                  <div>
                    <div className="font-bold text-white text-xs">{cex.name}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{cex.connected ? cex.apiKey : 'Disconnected'}</div>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${cex.connected ? 'bg-[#14B8A6]' : 'bg-[#6B7280]'}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Sales & Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ks-panel p-5 rounded-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xs bg-[#F5C842]/10 text-[#F5C842] flex items-center justify-center border border-[#F5C842]/25 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#9CA3AF] font-medium">Today's Sales Volume</div>
            <div className="text-2xl font-bold text-white font-mono-data">
              ${totalUsdtToday.toLocaleString()} USDT
            </div>
            <div className="text-[10px] text-[#14B8A6] font-mono-data">≈ {totalVndToday.toLocaleString()} VND</div>
          </div>
        </div>

        <div className="ks-panel p-5 rounded-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xs bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center border border-[#14B8A6]/25 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#9CA3AF] font-medium">AI Auto-Released Today</div>
            <div className="text-2xl font-bold text-[#14B8A6] font-mono-data">
              {autoCompletedCount} Trades
            </div>
            <div className="text-[10px] text-[#9CA3AF] font-mono-data">100% Zero Seller Wait</div>
          </div>
        </div>

        <div className="ks-panel p-5 rounded-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xs bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/25 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#9CA3AF] font-medium">Requires Manual Review</div>
            <div className="text-2xl font-bold text-amber-400 font-mono-data">
              {needsReviewCount} Order
            </div>
            <div className="text-[10px] text-[#9CA3AF] font-mono-data">Flagged Mismatched Proof</div>
          </div>
        </div>

        <div className="ks-panel p-5 rounded-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xs bg-[#F5C842]/10 text-[#F5C842] flex items-center justify-center border border-[#F5C842]/25 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#9CA3AF] font-medium">Reputation Score</div>
            <div className="text-2xl font-bold text-white font-mono-data">
              100 / 100
            </div>
            <div className="text-[10px] text-[#9CA3AF] font-mono-data">Verified Merchant Badge</div>
          </div>
        </div>
      </div>

      {/* CEX Orders Stream & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-light text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F5C842]" /> Real-Time CEX P2P Order Stream
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#040507] p-1 rounded-xs border border-[#F5C842]/16 font-mono-data text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-xs font-medium transition-all ${activeFilter === 'ALL' ? 'bg-[#F5C842] text-[#090A0D] font-bold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              All Trades ({cexOrders.length})
            </button>
            <button
              onClick={() => setActiveFilter('COMPLETED_AUTO')}
              className={`px-3 py-1 rounded-xs font-medium transition-all ${activeFilter === 'COMPLETED_AUTO' ? 'bg-[#14B8A6] text-[#090A0D] font-bold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Auto-Released ({autoCompletedCount})
            </button>
            <button
              onClick={() => setActiveFilter('NEEDS_REVIEW')}
              className={`px-3 py-1 rounded-xs font-medium transition-all ${activeFilter === 'NEEDS_REVIEW' ? 'bg-amber-400 text-[#090A0D] font-bold' : 'text-[#9CA3AF] hover:text-white'}`}
            >
              Needs Review ({needsReviewCount})
            </button>
          </div>
        </div>

        {/* CEX Orders Stream Cards */}
        <div className="space-y-3">
          {filteredCexOrders.map(ord => (
            <div
              key={ord.id}
              className="ks-panel p-5 rounded-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono-data"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="ks-badge-gold px-2.5 py-0.5 rounded-xs font-medium text-xs">
                    {ord.exchange}
                  </span>
                  <span className="text-sm font-bold text-white">{ord.id}</span>
                  <span className="text-xs text-[#14B8A6] font-bold">{ord.cryptoAmount} USDT</span>
                  <span className="text-xs text-[#9CA3AF]">• {ord.fiatAmount.toLocaleString()} {ord.currency}</span>
                  <span className="text-[10px] text-[#6B7280] ml-auto lg:ml-0">{ord.timestamp}</span>
                </div>

                <div className="text-xs text-[#E5E7EB]">
                  Buyer: <span className="font-bold text-white">{ord.buyerName}</span> • Bank: <span className="font-bold text-white">{ord.bankName}</span> ({ord.accountNumber}) • Memo: <span className="text-amber-400 font-bold">{ord.refCode}</span>
                </div>

                <div className="text-[11px] text-[#9CA3AF] bg-[#040507] p-2.5 rounded-xs border border-white/5 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#F5C842] shrink-0" />
                  <span>{ord.aiReason}</span>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-[#9CA3AF]">AI Confidence</div>
                  <div className={`text-sm font-bold ${ord.aiScore > 90 ? 'text-[#14B8A6]' : 'text-amber-400'}`}>
                    {ord.aiScore}% Match
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-xs text-xs font-bold uppercase ${
                    ord.status === 'COMPLETED_AUTO'
                      ? 'ks-badge-patina'
                      : ord.status === 'NEEDS_REVIEW'
                      ? 'ks-badge-gold'
                      : 'ks-badge-vermilion'
                  }`}
                >
                  {ord.status === 'COMPLETED_AUTO' ? '✓ Auto-Released' : '⚠️ Needs Review'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
