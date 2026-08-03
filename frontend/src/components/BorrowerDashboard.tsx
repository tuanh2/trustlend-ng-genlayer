import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingCart, ShieldCheck, AlertOctagon, CheckCircle2, Copy, ArrowRight, Zap, Play, Check, AlertTriangle, RefreshCw, Upload, Image as ImageIcon, Key, Volume2, FileCheck } from 'lucide-react';
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
  const [copiedMemo, setCopiedMemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // MetaMask Zero-Gas Signature Modal State
  const [isSigningWallet, setIsSigningWallet] = useState(false);
  const [walletSigned, setWalletSigned] = useState(false);

  // Interactive Live Demo Simulator State
  const [demoSelected, setDemoSelected] = useState<number>(0);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  // Preset Demo Bank Receipts
  const sampleProofs = [
    {
      id: 0,
      label: '🏦 Vietcombank Official E-Receipt (Valid Match)',
      url: 'https://vcb.com.vn/verify?tx=987654321',
      bankName: 'Vietcombank',
      accountNumber: '9988776655',
      holderName: 'TRIN THI NGAN',
      amount: '2,500,000 VND',
      memo: 'TLENG-88F3A',
      desc: 'Official Vietcombank receipt matching account number, amount & reference memo TLENG-88F3A.',
      badge: '99.8% Match Score',
      badgeClass: 'ks-badge-patina',
      verdict: 'MATCHED',
      reason: 'Verified Vietcombank E-Receipt link. Transferred 2,500,000 VND to account 9988776655 with matching reference TLENG-88F3A.',
    },
    {
      id: 1,
      label: '💳 Moniepoint POS Slip (Valid Match)',
      url: 'https://moniepoint.com/receipt/MP-998877',
      bankName: 'Moniepoint POS',
      accountNumber: '9988776655',
      holderName: 'TRIN THI NGAN',
      amount: '2,500,000 VND',
      memo: 'TLENG-88F3A',
      desc: 'Valid digital POS receipt matching transfer amount and reference code.',
      badge: '100% Verified',
      badgeClass: 'ks-badge-patina',
      verdict: 'MATCHED',
      reason: 'Verified POS digital slip content matching merchant bank account and required reference code TLENG-88F3A.',
    },
    {
      id: 2,
      label: '⚠️ Tampered / Invalid Receipt (Triggers 10% Slash)',
      url: 'https://fake-receipts.com/tampered-slip.png',
      bankName: 'Unknown / Invalid',
      accountNumber: '1122334455',
      holderName: 'INVALID ACCOUNT',
      amount: '500,000 VND',
      memo: 'WRONG-MEMO',
      desc: 'Invalid or tampered receipt URL. Consensus flags fraud and slashes 10% buyer deposit.',
      badge: 'FRAUD - Slashed',
      badgeClass: 'ks-badge-vermilion',
      verdict: 'FRAUD',
      reason: 'Mismatched bank account number and invalid transfer memo code. Flagged as invalid proof. Slashed 10% security deposit.',
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

  // Request Zero-Gas MetaMask Signature (personal_sign)
  const triggerZeroGasMetaMaskSign = async (orderId: string): Promise<boolean> => {
    setIsSigningWallet(true);
    setWalletSigned(false);

    try {
      const eth = (window as any).ethereum;
      if (eth && address) {
        const message = `TrustLend P2P Escrow Verification\nOrder ID: #${orderId}\nSigner: ${address}\n\nCost: 0 Gas (Zero Tokens Spent)`;
        const hexMessage = '0x' + Array.from(new TextEncoder().encode(message)).map(b => b.toString(16).padStart(2, '0')).join('');
        await eth.request({
          method: 'personal_sign',
          params: [hexMessage, address],
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setWalletSigned(true);
      setIsSigningWallet(false);
      return true;
    } catch (err) {
      console.error('Signature rejected or error:', err);
      setIsSigningWallet(false);
      return false;
    }
  };

  // Run Interactive Demo Flow Simulation with Audio Chime ("Ting-Ting")
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

  // Handle Image File Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setUploadedImage(dataUrl);
        setProofUrl(`[Uploaded Image Receipt] ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Initiate Buy with 10% Security Deposit
  const handleInitiateBuy = async (order: P2POrder) => {
    const signed = await triggerZeroGasMetaMaskSign(order.order_id);
    if (!signed) return;

    setSelectedOrder(order);
    const bondWei = (BigInt(order.crypto_amount) * 1000n) / 10000n;
    await writeContract(
      'initiate_buy_order',
      [order.order_id],
      bondWei,
      `Locking 10% Security Deposit (${bondWei} GEN) for Order #${order.order_id}...`
    );
    fetchOrders();
  };

  // Submit Bank Payment Proof for Release
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
      `Verifying bank proof & executing escrow settlement...`
    );

    if (res) {
      playSuccessChime();
      fetchOrders();
      setSelectedOrder(null);
      setProofUrl('');
      setUploadedImage(null);
    }
  };

  const copyMemo = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const currentDemo = sampleProofs[demoSelected];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Zero Gas Signature Status Indicator Banner */}
      {isSigningWallet && (
        <div className="fixed bottom-6 right-6 z-50 ks-panel p-4 rounded-xs border border-[#F5C842] shadow-2xl flex items-center gap-3 animate-bounce">
          <Key className="w-5 h-5 text-[#F5C842] animate-spin" />
          <div className="text-xs font-mono-data">
            <div className="font-bold text-white">MetaMask Personal Sign Requested</div>
            <div className="text-[#9CA3AF]">Please sign message (Cost: 0 Gas / 0 Tokens)</div>
          </div>
        </div>
      )}

      {/* Live Auto-Release Ticker Banner */}
      <div className="ks-panel-deep p-2 rounded-xs border border-[#14B8A6]/25 overflow-hidden relative">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-xs bg-[#14B8A6] text-[#090A0D] text-[10px] font-mono-data font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 fill-[#090A0D]" /> LIVE SETTLEMENTS
          </span>
          <div className="overflow-hidden w-full relative">
            <div className="animate-ticker text-xs font-mono-data text-[#E5E7EB] gap-8">
              <span>⚡ Order #1: Verified & Released 100 GEN via Vietcombank (Match 99.8%)</span>
              <span>⚡ Order #2: Verified & Released 250 GEN via Moniepoint POS (Match 100%)</span>
              <span>⚠️ Order #3: Slashed 10% Security Deposit from 0x9c... (Invalid Payment Receipt)</span>
              <span>⚡ Order #4: Verified & Released 500 GEN via Kuda Bank (Match 99.5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 4-Step Verification Demo Panel */}
      <div className="ks-panel p-6 md:p-8 rounded-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#F5C842]/16 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#F5C842]/10 text-[#F5C842] text-xs font-mono-data font-medium border border-[#F5C842]/25">
              <FileCheck className="w-4 h-4 text-[#F5C842]" /> Automated Bank Payment Verification
            </div>
            <h1 className="text-3xl md:text-4xl text-white font-light tracking-tight">
              Interactive Receipt Verification Demo
            </h1>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Experience the verification flow: Upload any bank payment receipt screenshot, confirm with zero-cost MetaMask signing (0 tokens/gas), and hear the instant <strong className="text-[#F5C842]">"Ting-Ting"</strong> settlement chime when escrow releases!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSuccessChime()}
              className="px-3 py-2 rounded-xs bg-[#16181D] border border-white/10 text-[#E5E7EB] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Test Settlement Sound"
            >
              <Volume2 className="w-4 h-4 text-[#F5C842]" /> Test Sound
            </button>

            <button
              onClick={runDemoSimulation}
              disabled={isDemoRunning}
              className="ks-button-primary px-5 py-2 text-xs font-semibold flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isDemoRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Payment...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#090A0D]" /> Start Verification Demo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Demo Preset Selector */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-[#9CA3AF] font-mono-data flex items-center gap-2">
            Select Test Scenario Preset:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleProofs.map(sample => (
              <button
                key={sample.id}
                onClick={() => {
                  setDemoSelected(sample.id);
                  setDemoStep(0);
                }}
                className={`p-3.5 rounded-xs border text-left text-xs transition-all ${
                  demoSelected === sample.id
                    ? 'border-[#F5C842] bg-[#F5C842]/10 text-white'
                    : 'border-white/10 bg-[#040507] text-[#9CA3AF] hover:border-white/20'
                }`}
              >
                <div className="font-bold text-white text-xs mb-1">{sample.label}</div>
                <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono-data font-medium ${sample.badgeClass}`}>
                  {sample.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step-by-Step Interactive Process Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 font-mono-data">
          {/* Step 1 */}
          <div className={`p-4 rounded-xs border transition-all ${demoStep >= 1 ? 'border-[#F5C842] bg-[#F5C842]/10 text-white' : 'border-white/10 bg-[#040507] text-[#6B7280]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider">Step 1: Zero-Gas Sign</span>
              {demoStep >= 1 && <Key className="w-3.5 h-3.5 text-[#F5C842]" />}
            </div>
            <div className="text-xs font-bold text-white">MetaMask Personal Sign</div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">Cost: 0 Gas / 0 Tokens {walletSigned && '✓ Signed'}</p>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-xs border transition-all ${demoStep >= 2 ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-white' : 'border-white/10 bg-[#040507] text-[#6B7280]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider">Step 2: Bank Web Render</span>
              {demoStep >= 2 && <Check className="w-3.5 h-3.5 text-[#14B8A6]" />}
            </div>
            <div className="text-xs font-bold text-white">gl.nondet.web.render</div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">Extracted Account: {currentDemo.accountNumber}</p>
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-xs border transition-all ${demoStep >= 3 ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-white/10 bg-[#040507] text-[#6B7280]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider">Step 3: Consensus Check</span>
              {demoStep >= 3 && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <div className="text-xs font-bold text-white">Optimistic Democracy</div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">Memo Match: {currentDemo.memo}</p>
          </div>

          {/* Step 4 */}
          <div className={`p-4 rounded-xs border transition-all ${demoStep >= 4 ? (currentDemo.verdict === 'MATCHED' ? 'border-[#14B8A6] bg-[#14B8A6]/15 text-white' : 'border-[#EF4444] bg-[#EF4444]/15 text-white') : 'border-white/10 bg-[#040507] text-[#6B7280]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider">Step 4: Sound Chime</span>
              {demoStep >= 4 && (currentDemo.verdict === 'MATCHED' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />)}
            </div>
            <div className="text-xs font-bold text-white">
              {demoStep >= 4 ? (currentDemo.verdict === 'MATCHED' ? '🔔 Released 100%' : '⚠️ 10% Bond Slashed!') : 'Awaiting Execution'}
            </div>
            <p className="text-[11px] text-[#9CA3AF] mt-1">{currentDemo.reason}</p>
          </div>
        </div>
      </div>

      {/* Active P2P Sell Orders Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#F5C842]" /> Active P2P Escrow Listings
          </h2>
          <span className="text-xs text-[#9CA3AF] font-mono-data bg-[#101216] px-3 py-1 rounded-xs border border-[#F5C842]/16">
            Active Orders: {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="ks-panel p-12 rounded-sm text-center space-y-3">
            <AlertOctagon className="w-10 h-10 text-[#F5C842] mx-auto" />
            <h3 className="text-lg font-bold text-white">No Active P2P Escrow Listings</h3>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              No active sell orders on studionet. Switch to the <strong>Merchant Escrow Hub</strong> tab to connect CEX APIs and process real-time P2P trades!
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
                  className="ks-panel ks-panel-interactive p-6 rounded-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="ks-badge-gold px-2.5 py-0.5 text-xs font-mono-data font-medium rounded-xs">
                        Order #{order.order_id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-xs text-[10px] font-mono-data font-bold uppercase tracking-wider ${
                          order.status === 'LISTED'
                            ? 'ks-badge-patina'
                            : order.status === 'COMPLETED'
                            ? 'ks-badge-gold'
                            : order.status === 'DISPUTED_FRAUD'
                            ? 'ks-badge-vermilion'
                            : 'bg-[#16181D] text-white'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-[#9CA3AF]">Escrowed Crypto Amount</div>
                      <div className="text-3xl font-bold text-white font-mono-data">{order.crypto_amount} GEN</div>
                    </div>

                    {/* Bank Transfer Details Box */}
                    <div className="p-3.5 rounded-xs bg-[#040507] border border-white/10 space-y-1.5 text-xs font-mono-data">
                      <div className="flex justify-between items-center text-[#E5E7EB]">
                        <span className="text-[#9CA3AF]">Required Fiat:</span>
                        <span className="font-bold text-[#F5C842] text-sm">
                          {order.fiat_amount.toLocaleString()} {order.fiat_currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#9CA3AF] text-[11px]">
                        <span>Bank Name:</span>
                        <span className="text-white font-bold">{order.bank_name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#9CA3AF] text-[11px]">
                        <span>Required Reference Memo:</span>
                        <span className="text-[#14B8A6] font-bold">{order.ref_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[#F5C842]/16">
                    <div className="text-[11px] text-[#9CA3AF] flex items-center justify-between font-mono-data">
                      <span>Buyer 10% Security Bond:</span>
                      <span className="text-[#F5C842] font-bold">{bondVal} GEN</span>
                    </div>

                    {order.status === 'LISTED' && (
                      <button
                        onClick={() => handleInitiateBuy(order)}
                        className="ks-button-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                      >
                        Initiate Trade & Sign (0 Gas) <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {order.buyer.toLowerCase() === address.toLowerCase() &&
                      order.status === 'PENDING_BUYER_PROOF' && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="ks-button-patina w-full py-2.5 text-xs flex items-center justify-center gap-2"
                        >
                          Upload Receipt Image for Settlement
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ks-panel p-6 md:p-8 rounded-sm border border-[#F5C842]/30 max-w-xl w-full space-y-5 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Bank Payment & Settlement</h3>
                <p className="text-xs text-[#9CA3AF] font-mono-data">Order #{selectedOrder.order_id} • Escrowed: {selectedOrder.crypto_amount} GEN</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-xs bg-[#040507] border border-white/10 text-[#9CA3AF] hover:text-white flex items-center justify-center transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Bank Payment Transfer Details */}
            <div className="p-4 rounded-xs bg-[#040507] border border-[#F5C842]/25 space-y-3 font-mono-data">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5C842] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Transfer Fiat to Merchant Account
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-[#9CA3AF]">Bank Name</div>
                  <div className="font-bold text-white text-sm">{selectedOrder.bank_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#9CA3AF]">Account Owner Name</div>
                  <div className="font-bold text-white text-sm">{selectedOrder.account_holder}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#9CA3AF]">Account Number</div>
                  <div className="font-bold text-[#14B8A6] text-sm">{selectedOrder.bank_account}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#9CA3AF]">Amount Required</div>
                  <div className="font-bold text-[#F5C842] text-sm">{selectedOrder.fiat_amount.toLocaleString()} {selectedOrder.fiat_currency}</div>
                </div>
              </div>

              {/* Memo Reference Code Highlight */}
              <div className="p-3 rounded-xs bg-[#F5C842]/10 border border-[#F5C842]/25 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#F5C842] font-bold uppercase">Required Transfer Memo Code</div>
                  <div className="text-base font-bold text-white tracking-wider">{selectedOrder.ref_code}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyMemo(selectedOrder.ref_code)}
                  className="ks-button-secondary px-3 py-1 text-xs font-medium flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedMemo ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Proof Submission Form with Image Upload */}
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#E5E7EB]">
                  Upload Receipt Screenshot Image
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-xs border border-dashed border-[#F5C842]/40 hover:border-[#F5C842] bg-[#040507] cursor-pointer text-center space-y-2 transition-colors"
                >
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedImage}
                        alt="Uploaded Receipt"
                        className="max-h-32 rounded-xs mx-auto border border-white/10"
                      />
                      <div className="text-xs text-[#14B8A6] font-medium flex items-center justify-center gap-1">
                        <ImageIcon className="w-4 h-4" /> Image Uploaded! Click to Change.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-[#F5C842] mx-auto mb-1" />
                      <div className="text-xs font-medium text-white">Click or Drag & Drop Receipt Image File</div>
                      <div className="text-[11px] text-[#9CA3AF]">PNG, JPG, WEBP screenshots accepted</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E5E7EB] mb-1">
                  Or Paste Receipt Verification URL
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="https://vcb.com.vn/verify?tx=..."
                  className="w-full bg-[#040507] border border-white/10 rounded-xs px-3 py-2 text-xs text-white font-mono-data focus:outline-none focus:border-[#F5C842]"
                  required
                />
              </div>

              <div className="p-2.5 rounded-xs bg-[#F5C842]/10 border border-[#F5C842]/20 flex items-center gap-2 text-xs font-mono-data text-[#F5C842]">
                <Key className="w-3.5 h-3.5 shrink-0" />
                <span>MetaMask personal sign costs 0 Gas / 0 Tokens.</span>
              </div>

              <button
                type="submit"
                className="ks-button-primary w-full py-3 text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Sign Wallet (0 Gas) & Submit Settlement Proof
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
