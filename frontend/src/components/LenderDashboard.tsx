import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, RefreshCw, XCircle, ArrowRightLeft, DollarSign, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';
import type { P2POrder } from '../types';

interface SellerHubProps {
  address: string;
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const LenderDashboard: React.FC<SellerHubProps> = ({
  address,
  readContract,
  writeContract,
}) => {
  // Form State for Creating On-Chain Sell Order
  const [cryptoAmount, setCryptoAmount] = useState('100');
  const [fiatAmount, setFiatAmount] = useState('2540000');
  const [fiatCurrency, setFiatCurrency] = useState('VND');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccount, setBankAccount] = useState('9988776655');
  const [accountHolder, setAccountHolder] = useState('TRIN THI NGAN');
  const [refCode, setRefCode] = useState(() => `TLENG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Real On-Chain Orders & Merchant Stats
  const [sellerOrders, setSellerOrders] = useState<P2POrder[]>([]);
  const [merchantProfile, setMerchantProfile] = useState<{ total_trades: number; successful_releases: number; reputation_score: number }>({
    total_trades: 0,
    successful_releases: 0,
    reputation_score: 100,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch On-Chain Seller Orders & Merchant Profile
  const fetchSellerData = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      // Get Market Info
      const marketInfo = await readContract('get_market_info');
      const totalCount = Number(marketInfo?.total_orders || 0);

      const fetchedList: P2POrder[] = [];
      for (let i = 1; i <= totalCount; i++) {
        const ordData = await readContract('get_order', [String(i)]);
        if (ordData && String(ordData.seller || '').toLowerCase() === address.toLowerCase()) {
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
      setSellerOrders(fetchedList);

      // Get Merchant Profile
      const profile = await readContract('get_merchant_profile', [address]);
      if (profile) {
        setMerchantProfile({
          total_trades: Number(profile.total_trades || 0),
          successful_releases: Number(profile.successful_releases || 0),
          reputation_score: Number(profile.reputation_score || 100),
        });
      }
    } catch (err) {
      console.error('Error fetching seller data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, readContract]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  // Handle On-Chain Create Sell Order
  const handleCreateSellOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoAmount || !fiatAmount || !bankAccount || !refCode) return;

    setIsSubmitting(true);
    try {
      const cryptoWei = BigInt(cryptoAmount);
      const res = await writeContract(
        'create_sell_order',
        [
          Number(fiatAmount),
          fiatCurrency,
          bankName,
          bankAccount,
          accountHolder,
          refCode,
        ],
        cryptoWei,
        `Locking ${cryptoAmount} GEN in Smart Contract Escrow...`
      );

      if (res) {
        fetchSellerData();
        // Generate new random memo for next order
        setRefCode(`TLENG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error creating sell order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle On-Chain Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await writeContract(
        'cancel_sell_order',
        [orderId],
        undefined,
        `Cancelling Order #${orderId} & Refunding Locked Crypto...`
      );
      if (res) {
        fetchSellerData();
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const copyMemo = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Seller Hub Header */}
      <div className="min-card p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#1F2026] pb-6">
          <div className="space-y-1 max-w-xl">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#F59E0B]" /> Seller Escrow Hub
            </h1>
            <p className="text-xs text-[#9CA3AF]">
              Create on-chain P2P sell listings, lock crypto into GenLayer escrow, and track automatic payment settlement backed by 10% buyer deposit protection.
            </p>
          </div>

          <button
            onClick={fetchSellerData}
            disabled={isLoading}
            className="min-btn-secondary px-4 py-2 text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh On-Chain Orders
          </button>
        </div>

        {/* On-Chain Merchant Stats Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-data">
          <div className="min-card-inset p-4 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <div>
              <div className="text-[10px] text-[#9CA3AF]">On-Chain Seller Orders</div>
              <div className="text-lg font-bold text-white">{sellerOrders.length} Listings</div>
            </div>
          </div>

          <div className="min-card-inset p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
            <div>
              <div className="text-[10px] text-[#9CA3AF]">Successful Escrow Releases</div>
              <div className="text-lg font-bold text-[#10B981]">{merchantProfile.successful_releases} Trades</div>
            </div>
          </div>

          <div className="min-card-inset p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <div>
              <div className="text-[10px] text-[#9CA3AF]">Reputation Score</div>
              <div className="text-lg font-bold text-white">{merchantProfile.reputation_score} / 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Create Order Form & Seller Active Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Sell Order Form */}
        <div className="min-card p-6 space-y-5 lg:col-span-1">
          <div className="border-b border-[#1F2026] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#F59E0B]" /> Create On-Chain Escrow Order
            </h2>
            <p className="text-[11px] text-[#9CA3AF]">Lock GEN into GenLayer Intelligent Contract</p>
          </div>

          <form onSubmit={handleCreateSellOrder} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#9CA3AF] mb-1">Crypto Amount to Escrow ($GEN)</label>
              <input
                type="number"
                value={cryptoAmount}
                onChange={e => setCryptoAmount(e.target.value)}
                placeholder="100"
                min="1"
                className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-white font-mono-data focus:outline-none focus:border-[#F59E0B]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#9CA3AF] mb-1">Required Fiat</label>
                <input
                  type="number"
                  value={fiatAmount}
                  onChange={e => setFiatAmount(e.target.value)}
                  placeholder="2540000"
                  className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-white font-mono-data focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#9CA3AF] mb-1">Currency</label>
                <select
                  value={fiatCurrency}
                  onChange={e => setFiatCurrency(e.target.value)}
                  className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-white font-mono-data focus:outline-none"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#9CA3AF] mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="Vietcombank"
                className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#F59E0B]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#9CA3AF] mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  placeholder="9988776655"
                  className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-white font-mono-data focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#9CA3AF] mb-1">Account Owner Name</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value)}
                  placeholder="TRIN THI NGAN"
                  className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-[#F59E0B]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#9CA3AF]">Required Transfer Memo Code</label>
                <button
                  type="button"
                  onClick={() => copyMemo(refCode)}
                  className="text-[10px] text-[#F59E0B] hover:underline flex items-center gap-1 font-mono-data"
                >
                  <Copy className="w-3 h-3" /> {copiedMemo ? 'Copied' : 'Copy'}
                </button>
              </div>
              <input
                type="text"
                value={refCode}
                onChange={e => setRefCode(e.target.value.toUpperCase())}
                className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-[#F59E0B] font-mono-data font-bold tracking-wider focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Locking Escrow...
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" /> Lock Crypto & Publish Sell Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* My On-Chain Seller Orders */}
        <div className="min-card p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#1F2026] pb-3">
            <h2 className="text-base font-bold text-white">My Active On-Chain Orders</h2>
            <span className="text-xs font-mono-data text-[#9CA3AF]">Total: {sellerOrders.length}</span>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="min-card-inset p-8 text-center space-y-2">
              <div className="text-xs font-semibold text-white">No Active On-Chain Orders</div>
              <p className="text-[11px] text-[#9CA3AF]">
                Fill out the form on the left to lock GEN into Smart Contract escrow and publish your first P2P sell order on GenLayer studionet!
              </p>
            </div>
          ) : (
            <div className="space-y-3 font-mono-data">
              {sellerOrders.map(order => (
                <div key={order.order_id} className="min-card-inset p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Order #{order.order_id}</span>
                      <span className="text-[#10B981] font-bold">{order.crypto_amount} GEN</span>
                      <span className="text-[#9CA3AF]">• {order.fiat_amount.toLocaleString()} {order.fiat_currency}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                      order.status === 'LISTED'
                        ? 'min-badge-amber'
                        : order.status === 'COMPLETED'
                        ? 'min-badge-emerald'
                        : order.status === 'DISPUTED_FRAUD'
                        ? 'min-badge-red'
                        : 'bg-[#1F2026] text-[#E5E7EB]'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#9CA3AF] grid grid-cols-2 gap-2">
                    <div>Bank: <span className="text-white font-medium">{order.bank_name} ({order.bank_account})</span></div>
                    <div>Memo: <span className="text-[#F59E0B] font-bold">{order.ref_code}</span></div>
                    <div>Account Holder: <span className="text-white">{order.account_holder}</span></div>
                    <div>Buyer: <span className="text-white">{order.buyer ? `${order.buyer.substring(0, 6)}...${order.buyer.substring(order.buyer.length - 4)}` : 'None'}</span></div>
                  </div>

                  {order.ai_reason && (
                    <div className="text-[11px] text-[#9CA3AF] bg-[#050507] p-2 rounded border border-[#1F2026]">
                      Consensus Note: {order.ai_reason}
                    </div>
                  )}

                  {order.status === 'LISTED' && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleCancelOrder(order.order_id)}
                        className="text-[11px] text-[#EF4444] hover:underline flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Order & Refund GEN
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
