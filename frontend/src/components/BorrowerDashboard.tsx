import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertOctagon, ArrowRight, Play, RefreshCw, Upload, Image as ImageIcon, Key, Volume2 } from 'lucide-react';
import type { P2POrder } from '../types';
import { playSuccessChime, playSlashAlert } from '../utils/audio';

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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MetaMask Zero-Gas Signature Modal State
  const [isSigningWallet, setIsSigningWallet] = useState(false);

  // Interactive Live Demo Simulator State
  const [demoSelected, setDemoSelected] = useState<number>(0);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  const sampleProofs = [
    {
      id: 0,
      label: 'Vietcombank Official E-Receipt (Valid Match)',
      url: 'https://vcb.com.vn/verify?tx=987654321',
      accountNumber: '9988776655',
      amount: '2,500,000 VND',
      memo: 'TLENG-88F3A',
      badge: '99.8% Match',
      badgeClass: 'min-badge-emerald',
      verdict: 'MATCHED',
      reason: 'Verified official Vietcombank E-Receipt. 2,500,000 VND transferred with memo TLENG-88F3A.',
    },
    {
      id: 1,
      label: 'Moniepoint POS Slip (Valid Match)',
      url: 'https://moniepoint.com/receipt/MP-998877',
      accountNumber: '9988776655',
      amount: '2,500,000 VND',
      memo: 'TLENG-88F3A',
      badge: '100% Verified',
      badgeClass: 'min-badge-emerald',
      verdict: 'MATCHED',
      reason: 'Verified POS receipt matching account 9988776655 and memo TLENG-88F3A.',
    },
    {
      id: 2,
      label: 'Tampered / Invalid Receipt (Triggers 10% Slash)',
      url: 'https://fake-receipts.com/tampered-slip.png',
      accountNumber: '1122334455',
      amount: '500,000 VND',
      memo: 'WRONG-MEMO',
      badge: 'FRAUD - Slashed',
      badgeClass: 'min-badge-red',
      verdict: 'FRAUD',
      reason: 'Mismatched bank account and invalid reference code. Slashed 10% buyer deposit.',
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

  const triggerZeroGasMetaMaskSign = async (orderId: string): Promise<boolean> => {
    setIsSigningWallet(true);
    try {
      const eth = (window as any).ethereum;
      if (eth && address) {
        const message = `TrustLend P2P Escrow Verification\nOrder ID: #${orderId}\nSigner: ${address}\nCost: 0 Gas`;
        const hexMessage = '0x' + Array.from(new TextEncoder().encode(message)).map(b => b.toString(16).padStart(2, '0')).join('');
        await eth.request({
          method: 'personal_sign',
          params: [hexMessage, address],
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setIsSigningWallet(false);
      return true;
    } catch (err) {
      console.error('Signature rejected:', err);
      setIsSigningWallet(false);
      return false;
    }
  };

  const runDemoSimulation = async () => {
    setIsDemoRunning(true);
    setDemoStep(1);

    await triggerZeroGasMetaMaskSign('DEMO-ORDER-1');

    setTimeout(() => setDemoStep(2), 1200);
    setTimeout(() => setDemoStep(3), 2400);
    setTimeout(() => {
      setDemoStep(4);
      setIsDemoRunning(false);

      if (sampleProofs[demoSelected].verdict === 'MATCHED') {
        playSuccessChime();
      } else {
        playSlashAlert();
      }
    }, 3800);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setProofUrl(`[Image Receipt] ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateBuy = async (order: P2POrder) => {
    const signed = await triggerZeroGasMetaMaskSign(order.order_id);
    if (!signed) return;

    setSelectedOrder(order);
    const bondWei = (BigInt(order.crypto_amount) * 1000n) / 10000n;
    await writeContract(
      'initiate_buy_order',
      [order.order_id],
      bondWei,
      `Locking 10% Security Deposit (${bondWei} GEN)...`
    );
    fetchOrders();
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !proofUrl) return;

    const signed = await triggerZeroGasMetaMaskSign(selectedOrder.order_id);
    if (!signed) return;

    const finalProof = uploadedImage ? uploadedImage.substring(0, 120) + '...' : proofUrl;
    const res = await writeContract(
      'submit_payment_proof',
      [selectedOrder.order_id, finalProof],
      undefined,
      `Executing escrow settlement...`
    );

    if (res) {
      playSuccessChime();
      fetchOrders();
      setSelectedOrder(null);
      setProofUrl('');
      setUploadedImage(null);
    }
  };

  const currentDemo = sampleProofs[demoSelected];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Zero Gas Indicator */}
      {isSigningWallet && (
        <div className="fixed bottom-6 right-6 z-50 min-card p-4 shadow-2xl flex items-center gap-3 border-[#F59E0B]">
          <Key className="w-4 h-4 text-[#F59E0B] animate-spin" />
          <div className="text-xs">
            <div className="font-semibold text-white">MetaMask Personal Sign</div>
            <div className="text-[#9CA3AF]">Cost: 0 Gas (Zero Tokens)</div>
          </div>
        </div>
      )}

      {/* Minimal Header */}
      <div className="min-card p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#1F2026] pb-6">
          <div className="space-y-1 max-w-2xl">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              P2P Escrow Market
            </h1>
            <p className="text-xs text-[#9CA3AF]">
              Zero-gas MetaMask verification, automatic bank receipt settlement, and 10% buyer deposit protection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSuccessChime()}
              className="min-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#F59E0B]" /> Test Sound
            </button>

            <button
              onClick={runDemoSimulation}
              disabled={isDemoRunning}
              className="min-btn-primary px-5 py-2 text-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isDemoRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" /> Run Verification Demo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-[#9CA3AF]">Select Test Scenario:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleProofs.map(sample => (
              <button
                key={sample.id}
                onClick={() => {
                  setDemoSelected(sample.id);
                  setDemoStep(0);
                }}
                className={`p-3.5 rounded-lg border text-left text-xs transition-all ${
                  demoSelected === sample.id
                    ? 'border-[#F59E0B] bg-[#141519] text-white'
                    : 'border-[#1F2026] bg-[#050507] text-[#9CA3AF] hover:border-[#373843]'
                }`}
              >
                <div className="font-semibold text-white text-xs mb-1.5">{sample.label}</div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data ${sample.badgeClass}`}>
                  {sample.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Step Progress Line */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 font-mono-data text-xs">
          <div className={`p-3.5 rounded-lg border ${demoStep >= 1 ? 'border-[#F59E0B] bg-[#141519] text-white' : 'border-[#1F2026] text-[#6B7280]'}`}>
            <div className="text-[10px] text-[#9CA3AF]">Step 1</div>
            <div className="font-semibold text-white">MetaMask Sign</div>
            <div className="text-[11px] text-[#9CA3AF]">0 Gas Cost</div>
          </div>

          <div className={`p-3.5 rounded-lg border ${demoStep >= 2 ? 'border-[#10B981] bg-[#141519] text-white' : 'border-[#1F2026] text-[#6B7280]'}`}>
            <div className="text-[10px] text-[#9CA3AF]">Step 2</div>
            <div className="font-semibold text-white">Render Bank Proof</div>
            <div className="text-[11px] text-[#9CA3AF]">{currentDemo.accountNumber}</div>
          </div>

          <div className={`p-3.5 rounded-lg border ${demoStep >= 3 ? 'border-amber-400 bg-[#141519] text-white' : 'border-[#1F2026] text-[#6B7280]'}`}>
            <div className="text-[10px] text-[#9CA3AF]">Step 3</div>
            <div className="font-semibold text-white">Consensus Check</div>
            <div className="text-[11px] text-[#9CA3AF]">{currentDemo.memo}</div>
          </div>

          <div className={`p-3.5 rounded-lg border ${demoStep >= 4 ? (currentDemo.verdict === 'MATCHED' ? 'border-[#10B981] bg-[#141519] text-white' : 'border-[#EF4444] bg-[#141519] text-white') : 'border-[#1F2026] text-[#6B7280]'}`}>
            <div className="text-[10px] text-[#9CA3AF]">Step 4</div>
            <div className="font-semibold text-white">
              {demoStep >= 4 ? (currentDemo.verdict === 'MATCHED' ? 'Released 100%' : 'Deposit Slashed') : 'Awaiting'}
            </div>
            <div className="text-[11px] text-[#9CA3AF] truncate">{currentDemo.reason}</div>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Active Listings</h2>
          <span className="text-xs text-[#9CA3AF] font-mono-data bg-[#0E0F12] px-3 py-1 rounded-md border border-[#1F2026]">
            Total: {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="min-card p-12 text-center space-y-2">
            <AlertOctagon className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <div className="text-sm font-semibold text-white">No Active P2P Listings</div>
            <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
              Switch to the <strong>Merchant Hub</strong> tab to connect CEX APIs and simulate real-time P2P trades.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map(order => {
              const cryptoVal = Number(order.crypto_amount);
              const bondVal = (cryptoVal * 0.1).toFixed(2);

              return (
                <div key={order.order_id} className="min-card p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-data text-[#F59E0B] font-semibold">
                        Order #{order.order_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data ${order.status === 'LISTED' ? 'min-badge-emerald' : 'min-badge-amber'}`}>
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-[#9CA3AF]">Amount</div>
                      <div className="text-2xl font-bold text-white font-mono-data">{order.crypto_amount} GEN</div>
                    </div>

                    <div className="min-card-inset p-3 space-y-1 text-xs font-mono-data">
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Required Fiat:</span>
                        <span className="text-white font-bold">{order.fiat_amount.toLocaleString()} {order.fiat_currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Bank:</span>
                        <span className="text-white">{order.bank_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Memo:</span>
                        <span className="text-[#10B981] font-bold">{order.ref_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#1F2026]">
                    <div className="text-[11px] text-[#9CA3AF] flex justify-between font-mono-data">
                      <span>Buyer 10% Bond:</span>
                      <span className="text-white font-semibold">{bondVal} GEN</span>
                    </div>

                    {order.status === 'LISTED' && (
                      <button
                        onClick={() => handleInitiateBuy(order)}
                        className="min-btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        Initiate Trade (0 Gas) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {order.buyer.toLowerCase() === address.toLowerCase() &&
                      order.status === 'PENDING_BUYER_PROOF' && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="min-btn-secondary w-full py-2 text-xs"
                        >
                          Upload Payment Receipt
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="min-card p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2026] pb-3">
              <h3 className="text-base font-bold text-white">Submit Payment Proof</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-xs text-[#9CA3AF] hover:text-white">✕</button>
            </div>

            <div className="min-card-inset p-3 space-y-1.5 text-xs font-mono-data">
              <div className="text-[10px] text-[#9CA3AF]">Merchant Account</div>
              <div className="text-white font-bold">{selectedOrder.bank_name} - {selectedOrder.bank_account}</div>
              <div className="text-[#F59E0B] font-bold">Memo: {selectedOrder.ref_code}</div>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-3">
              <input type="file" ref={fileInputRef} onChange={handleImageFileChange} accept="image/*" className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-lg border border-dashed border-[#1F2026] hover:border-[#373843] cursor-pointer text-center text-xs"
              >
                {uploadedImage ? (
                  <div className="text-[#10B981] font-medium flex items-center justify-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Image Loaded
                  </div>
                ) : (
                  <div className="text-[#9CA3AF]">
                    <Upload className="w-4 h-4 mx-auto mb-1 text-white" />
                    Click to Upload Receipt Screenshot
                  </div>
                )}
              </div>

              <input
                type="url"
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
                placeholder="Or paste verification link..."
                className="w-full bg-[#141519] border border-[#1F2026] rounded-lg px-3 py-2 text-xs text-white font-mono-data focus:outline-none"
                required
              />

              <button type="submit" className="min-btn-primary w-full py-2.5 text-xs font-semibold">
                Sign Wallet (0 Gas) & Execute Settlement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
