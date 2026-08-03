import React, { useState, useEffect, useCallback } from 'react';
import { Lock, PlusCircle, ShieldCheck, DollarSign, RefreshCw, XCircle, Bot, Zap, CheckCircle2, AlertTriangle, Cpu, Play, Key } from 'lucide-react';
import type { P2POrder, MerchantProfile, CEXConnection, CEXOrder } from '../types';
import { playSuccessChime } from '../utils/audio';

interface MerchantHubProps {
  address: string;
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const LenderDashboard: React.FC<MerchantHubProps> = ({
  address,
  readContract,
  writeContract,
}) => {
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

  // Form State
  const [cryptoAmount, setCryptoAmount] = useState('100');
  const [fiatAmount, setFiatAmount] = useState('2540000');
  const [fiatCurrency, setFiatCurrency] = useState('VND');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccount, setBankAccount] = useState('9988776655');
  const [accountHolder, setAccountHolder] = useState('TRIN THI NGAN');
  const [refCode, setRefCode] = useState('TLENG-' + Math.random().toString(36).substring(2, 7).toUpperCase());

  const [merchantOrders, setMerchantOrders] = useState<P2POrder[]>([]);
  const [profile, setProfile] = useState<MerchantProfile | null>(null);

  const fetchMerchantData = useCallback(async () => {
    if (!address) return;
    try {
      const profData = await readContract('get_merchant_profile', [address]);
      if (profData) {
        setProfile({
          name: profData.name || 'Merchant',
          total_trades: Number(profData.total_trades || 0),
          successful_releases: Number(profData.successful_releases || 0),
          reputation_score: Number(profData.reputation_score || 100),
        });
      }

      const marketInfo = await readContract('get_market_info');
      const totalCount = Number(marketInfo?.total_orders || 0);

      const myList: P2POrder[] = [];
      for (let i = 1; i <= totalCount; i++) {
        const ordData = await readContract('get_order', [String(i)]);
        if (ordData && String(ordData.seller).toLowerCase() === address.toLowerCase()) {
          myList.push({
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
      setMerchantOrders(myList);
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    }
  }, [address, readContract]);

  useEffect(() => {
    fetchMerchantData();
  }, [fetchMerchantData]);

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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const cryptoVal = Number(cryptoAmount);
    const fiatVal = Number(fiatAmount);
    if (isNaN(cryptoVal) || cryptoVal <= 0 || isNaN(fiatVal) || fiatVal <= 0) return;

    const cryptoWei = BigInt(cryptoVal);
    const res = await writeContract(
      'create_sell_order',
      [fiatVal, fiatCurrency, bankName, bankAccount, accountHolder, refCode],
      cryptoWei,
      `Locking ${cryptoVal} GEN in Escrow for Sell Order...`
    );

    if (res) {
      fetchMerchantData();
      setRefCode('TLENG-' + Math.random().toString(36).substring(2, 7).toUpperCase());
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const res = await writeContract(
      'cancel_sell_order',
      [orderId],
      undefined,
      `Cancelling Sell Order #${orderId} & refunding locked GEN...`
    );
    if (res) fetchMerchantData();
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
      <div className="gl-violet-panel p-6 md:p-8 rounded-3xl border border-[#A855F7]/30 bg-gradient-to-r from-[#0F091F] via-[#160D2E] to-[#2E1065] relative overflow-hidden shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#A855F7]/15 text-[#E9D5FF] text-xs font-mono-data font-bold border border-[#A855F7]/30">
              <Bot className="w-4 h-4 text-[#A855F7] animate-pulse" /> Merchant AI Auto-Release Bot Hub
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white font-syne tracking-tight">
              CEX Multi-Exchange P2P Auto-Seller Bot
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your Binance, OKX, Bybit & MEXC P2P API keys. GenLayer AI automatically verifies buyer bank payments in real-time and releases USDT/Crypto <strong>without any seller manual effort!</strong>
            </p>
          </div>

          <button
            onClick={simulateIncomingCEXOrder}
            disabled={isSimulatingOrder}
            className="gl-btn-violet px-6 py-3.5 text-xs font-black flex items-center gap-2 shrink-0 shadow-lg shadow-[#A855F7]/30 disabled:opacity-50"
          >
            {isSimulatingOrder ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Receiving CEX Order...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> ⚡ Simulate Incoming Binance 100 USDT Order
              </>
            )}
          </button>
        </div>

        {/* CEX API Connection Badges */}
        <div className="space-y-2 pt-2 border-t border-white/10 font-mono-data">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-[#A855F7]" /> Connected Exchange P2P APIs:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cexList.map(cex => (
              <div
                key={cex.id}
                onClick={() => toggleCexConnection(cex.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  cex.connected
                    ? 'border-[#A855F7]/50 bg-[#A855F7]/15 text-white shadow-md shadow-[#A855F7]/10'
                    : 'border-white/10 bg-slate-950/40 text-slate-500 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cex.logo}</span>
                  <div>
                    <div className="font-bold text-white text-xs">{cex.name}</div>
                    <div className="text-[10px] text-slate-400">{cex.connected ? cex.apiKey : 'Disconnected'}</div>
                  </div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${cex.connected ? 'bg-[#10B981] animate-pulse' : 'bg-slate-600'}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Sales & Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gl-violet-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/20 text-[#E9D5FF] flex items-center justify-center border border-[#A855F7]/30 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Today's Sales Volume</div>
            <div className="text-2xl font-black text-white font-mono-data">
              ${totalUsdtToday.toLocaleString()} USDT
            </div>
            <div className="text-[10px] text-[#10B981] font-mono-data">≈ {totalVndToday.toLocaleString()} VND</div>
          </div>
        </div>

        <div className="gl-violet-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">AI Auto-Released Today</div>
            <div className="text-2xl font-black text-[#10B981] font-mono-data">
              {autoCompletedCount} Trades
            </div>
            <div className="text-[10px] text-slate-400 font-mono-data">100% Zero Seller Wait</div>
          </div>
        </div>

        <div className="gl-violet-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Requires Manual Review</div>
            <div className="text-2xl font-black text-amber-400 font-mono-data">
              {needsReviewCount} Order
            </div>
            <div className="text-[10px] text-slate-400 font-mono-data">Flagged Mismatched Proof</div>
          </div>
        </div>

        <div className="gl-violet-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Reputation Score</div>
            <div className="text-2xl font-black text-purple-300 font-mono-data">
              {profile ? profile.reputation_score : 100} / 100
            </div>
            <div className="text-[10px] text-slate-400 font-mono-data">Verified Merchant Badge</div>
          </div>
        </div>
      </div>

      {/* CEX Orders Stream & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white font-syne flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#A855F7]" /> Real-Time CEX P2P Order Stream
          </h3>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#0F091F] p-1 rounded-2xl border border-[#A855F7]/20 font-mono-data text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${activeFilter === 'ALL' ? 'bg-[#A855F7] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All Trades ({cexOrders.length})
            </button>
            <button
              onClick={() => setActiveFilter('COMPLETED_AUTO')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${activeFilter === 'COMPLETED_AUTO' ? 'bg-[#10B981] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Auto-Released ({autoCompletedCount})
            </button>
            <button
              onClick={() => setActiveFilter('NEEDS_REVIEW')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${activeFilter === 'NEEDS_REVIEW' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}
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
              className={`gl-violet-panel p-5 rounded-3xl border transition-all ${
                ord.status === 'COMPLETED_AUTO'
                  ? 'border-[#10B981]/30 bg-[#0F091F]'
                  : ord.status === 'NEEDS_REVIEW'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-rose-500/40 bg-rose-500/10'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono-data">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-[#A855F7]/15 text-[#E9D5FF] font-bold text-xs border border-[#A855F7]/30">
                      {ord.exchange}
                    </span>
                    <span className="text-sm font-black text-white">{ord.id}</span>
                    <span className="text-xs text-[#10B981] font-bold">{ord.cryptoAmount} USDT</span>
                    <span className="text-xs text-slate-400">• {ord.fiatAmount.toLocaleString()} {ord.currency}</span>
                    <span className="text-[10px] text-slate-500 ml-auto lg:ml-0">{ord.timestamp}</span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Buyer: <span className="font-bold text-white">{ord.buyerName}</span> • Bank: <span className="font-bold text-white">{ord.bankName}</span> ({ord.accountNumber}) • Memo: <span className="text-amber-400 font-bold">{ord.refCode}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-[#07040D] p-3 rounded-xl border border-white/5 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#A855F7] shrink-0" />
                    <span>{ord.aiReason}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">AI Confidence</div>
                    <div className={`text-sm font-black ${ord.aiScore > 90 ? 'text-[#10B981]' : 'text-amber-400'}`}>
                      {ord.aiScore}% Match
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${
                      ord.status === 'COMPLETED_AUTO'
                        ? 'gl-badge-emerald'
                        : ord.status === 'NEEDS_REVIEW'
                        ? 'gl-badge-gold'
                        : 'gl-badge-rose'
                    }`}
                  >
                    {ord.status === 'COMPLETED_AUTO' ? '✓ Auto-Released' : '⚠️ Needs Review'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lock Crypto & Create On-Chain Escrow Listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-1 gl-violet-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-syne">Create On-Chain P2P Escrow Order</h3>
              <p className="text-xs text-slate-400">Lock GEN into Escrow for GenLayer Network P2P trade.</p>
            </div>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">
                Crypto Amount to Escrow ($ GEN)
              </label>
              <input
                type="number"
                value={cryptoAmount}
                onChange={e => setCryptoAmount(e.target.value)}
                className="w-full bg-[#07040D] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#A855F7]"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">Required Fiat</label>
                <input
                  type="number"
                  value={fiatAmount}
                  onChange={e => setFiatAmount(e.target.value)}
                  className="w-full bg-[#07040D] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#A855F7]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">Currency</label>
                <select
                  value={fiatCurrency}
                  onChange={e => setFiatCurrency(e.target.value)}
                  className="w-full bg-[#07040D] border border-slate-700/80 rounded-xl px-2 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#A855F7]"
                >
                  <option value="VND">VND</option>
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full bg-[#07040D] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#A855F7]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  className="w-full bg-[#07040D] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#A855F7]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">Account Owner Name</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value)}
                  className="w-full bg-[#07040D] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#A855F7]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">
                Required Transfer Memo Code
              </label>
              <input
                type="text"
                value={refCode}
                onChange={e => setRefCode(e.target.value.toUpperCase())}
                className="w-full bg-[#07040D] border border-[#A855F7]/60 rounded-xl px-3 py-2 text-xs text-[#E9D5FF] font-mono-data font-bold focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="gl-btn-violet w-full py-3 text-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Lock Crypto & Publish Sell Order
            </button>
          </form>
        </div>

        {/* Merchant Active Escrow Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-syne">My Active On-Chain Listings</h3>
            <button
              onClick={fetchMerchantData}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono-data"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {merchantOrders.length === 0 ? (
            <div className="gl-violet-panel p-12 rounded-3xl text-center text-xs text-slate-400">
              You have no active P2P sell orders. Fill the form on the left to lock GEN into escrow!
            </div>
          ) : (
            <div className="space-y-3">
              {merchantOrders.map(ord => (
                <div
                  key={ord.order_id}
                  className="gl-violet-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono-data"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Order #{ord.order_id}</span>
                      <span className="text-xs text-[#10B981] font-bold">{ord.crypto_amount} GEN</span>
                      <span className="text-xs text-slate-400">• {ord.fiat_amount.toLocaleString()} {ord.fiat_currency}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Bank: {ord.bank_name} ({ord.bank_account}) • Memo: <span className="text-amber-400 font-bold">{ord.ref_code}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                        ord.status === 'LISTED'
                          ? 'gl-badge-violet'
                          : ord.status === 'COMPLETED'
                          ? 'gl-badge-[#10B981]'
                          : 'gl-badge-rose'
                      }`}
                    >
                      {ord.status}
                    </span>

                    {ord.status === 'LISTED' && (
                      <button
                        onClick={() => handleCancelOrder(ord.order_id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/30 flex items-center gap-1 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel & Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
