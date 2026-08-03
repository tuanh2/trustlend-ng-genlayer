import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Lock, PlusCircle, ShieldCheck, DollarSign, RefreshCw, XCircle } from 'lucide-react';
import type { P2POrder, MerchantProfile } from '../types';

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
  const [cryptoAmount, setCryptoAmount] = useState('100');
  const [fiatAmount, setFiatAmount] = useState('2500000');
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Merchant Header Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gl-cyber-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Merchant Reputation</div>
            <div className="text-2xl font-black text-white font-mono-data">
              {profile ? profile.reputation_score : 100} / 100
            </div>
          </div>
        </div>

        <div className="gl-cyber-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-[#00FF87]/20 text-[#00FF87] flex items-center justify-center border border-[#00FF87]/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Successful Releases</div>
            <div className="text-2xl font-black text-[#00FF87] font-mono-data">
              {profile ? profile.successful_releases : 0} Trades
            </div>
          </div>
        </div>

        <div className="gl-cyber-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">My Active Listings</div>
            <div className="text-2xl font-black text-purple-300 font-mono-data">
              {merchantOrders.length} Orders
            </div>
          </div>
        </div>

        <div className="gl-cyber-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-[#00F2FE]/20 text-[#38BDF8] flex items-center justify-center border border-[#00F2FE]/30 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Escrow Security</div>
            <div className="text-2xl font-black text-[#38BDF8] font-mono-data">100% On-Chain</div>
          </div>
        </div>
      </div>

      {/* Create P2P Sell Order Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 gl-cyber-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Create P2P Sell Order</h3>
              <p className="text-xs text-slate-400">Lock GEN into Escrow and specify bank payment details.</p>
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
                className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
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
                  className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">Currency</label>
                <select
                  value={fiatCurrency}
                  onChange={e => setFiatCurrency(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-2 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
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
                className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
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
                  className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono-data">Account Owner Name</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
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
                className="w-full bg-[#050811] border border-amber-500/60 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono-data font-bold focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="gl-btn-gold w-full py-3 text-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Lock Crypto & Publish Sell Order
            </button>
          </form>
        </div>

        {/* Merchant Active Escrow Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">My Active Merchant Listings</h3>
            <button
              onClick={fetchMerchantData}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono-data"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {merchantOrders.length === 0 ? (
            <div className="gl-cyber-panel p-12 rounded-3xl text-center text-xs text-slate-400">
              You have no active P2P sell orders. Fill the form on the left to lock GEN into escrow!
            </div>
          ) : (
            <div className="space-y-3">
              {merchantOrders.map(ord => (
                <div
                  key={ord.order_id}
                  className="gl-cyber-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono-data"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Order #{ord.order_id}</span>
                      <span className="text-xs text-[#00FF87] font-bold">{ord.crypto_amount} GEN</span>
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
                          ? 'gl-badge-cyan'
                          : ord.status === 'COMPLETED'
                          ? 'gl-badge-emerald'
                          : 'gl-badge-gold'
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
