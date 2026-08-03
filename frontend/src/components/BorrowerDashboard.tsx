import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, FileText, Send, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, HelpCircle, Zap } from 'lucide-react';
import type { Loan, BorrowerProfile } from '../types';
import { TrustScoreBadge } from './TrustScoreBadge';

interface BorrowerDashboardProps {
  address: string;
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({
  address,
  readContract,
  writeContract,
}) => {
  const [name, setName] = useState('Amina Traders');
  const [phone, setPhone] = useState('+234 802 345 6789');
  const [shopUrl, setShopUrl] = useState('https://jumia.com.ng/shop/amina-electronics');
  const [evidenceUrl, setEvidenceUrl] = useState('https://raw.githubusercontent.com/evidence/jumia_receipt.png');
  const [amount, setAmount] = useState('100');
  const [duration, setDuration] = useState('30');

  const [trustScore, setTrustScore] = useState<number>(50);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBorrowerData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const score = await readContract('get_trust_score', [address]);
      if (score !== null) setTrustScore(Number(score));

      const profData = await readContract('get_borrower_profile', [address]);
      if (profData) {
        setProfile({
          name: profData.name || '',
          phone: profData.phone || '',
          shop_url: profData.shop_url || '',
          evidence_urls: profData.evidence_urls || [],
          total_borrowed: String(profData.total_borrowed || '0'),
          total_repaid: String(profData.total_repaid || '0'),
          is_verified: Boolean(profData.is_verified),
        });
      }

      const poolInfo = await readContract('get_pool_info');
      const fetchedLoans: Loan[] = [];
      if (poolInfo && poolInfo.total_loans) {
        const count = Number(poolInfo.total_loans);
        for (let i = 1; i <= count; i++) {
          const lData = await readContract('get_loan', [String(i)]);
          if (lData && lData.borrower && lData.borrower.toLowerCase() === address.toLowerCase()) {
            fetchedLoans.push({
              id: String(i),
              borrower: lData.borrower,
              lender: lData.lender,
              principal: String(lData.principal),
              interest_rate: Number(lData.interest_rate),
              due_date: Number(lData.due_date),
              status: lData.status,
              evidence_url: lData.evidence_url,
              ai_verdict: lData.ai_verdict,
              ai_reason: lData.ai_reason,
              dispute_evidence: lData.dispute_evidence,
              dispute_verdict: lData.dispute_verdict,
            });
          }
        }
      }
      setLoans(fetchedLoans);
    } catch (err) {
      console.error('Error fetching borrower data:', err);
    } finally {
      setLoading(false);
    }
  }, [address, readContract]);

  useEffect(() => {
    fetchBorrowerData();
  }, [fetchBorrowerData]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !shopUrl || !evidenceUrl) {
      alert('Please fill out all loan application fields.');
      return;
    }

    const numAmt = Number(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert('Invalid loan amount.');
      return;
    }

    const res = await writeContract(
      'apply_for_loan',
      [name, phone, shopUrl, evidenceUrl, numAmt, Number(duration)],
      undefined,
      'Submitting application to GenLayer AI Underwriter...'
    );

    if (res) {
      fetchBorrowerData();
    }
  };

  const handleRepay = async (loan: Loan) => {
    const principalWei = BigInt(loan.principal);
    const interestWei = (principalWei * BigInt(loan.interest_rate)) / BigInt(10000);
    const totalDue = principalWei + interestWei;

    const res = await writeContract(
      'repay_loan',
      [loan.id],
      totalDue,
      `Repaying Loan #${loan.id}...`
    );

    if (res) {
      fetchBorrowerData();
    }
  };

  const fillSamplePreset = (presetType: 'jumia' | 'moniepoint' | 'utility') => {
    if (presetType === 'jumia') {
      setName('Amina Electronics Store');
      setShopUrl('https://jumia.com.ng/shop/amina-electronics');
      setEvidenceUrl('https://raw.githubusercontent.com/evidence/jumia_turnover_proof.png');
      setAmount('150');
    } else if (presetType === 'moniepoint') {
      setName('Chukwuma Provisions');
      setShopUrl('https://moniepoint.com/merchant/chukwuma-shop');
      setEvidenceUrl('https://raw.githubusercontent.com/evidence/pos_monthly_statement.png');
      setAmount('250');
    } else {
      setName('Kano Textile Mart');
      setShopUrl('https://jiji.ng/kano/textile-mart');
      setEvidenceUrl('https://raw.githubusercontent.com/evidence/kano_utility_bill.png');
      setAmount('100');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Reputation Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">AI Subjective Credit Underwriting</h2>
                <p className="text-xs text-slate-400">GenLayer Optimistic Democracy Consensus Engine</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mt-3">
              No bank account or credit history needed. Upload proof of real economic activity (Jumia/Jiji store pages, utility bills, Moniepoint POS statements). GenLayer AI validators render web data on-chain and disburse microcredit instantly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Bank History</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>On-Chain Web Render</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Semantic Consensus</span>
            </div>
          </div>
        </div>

        <TrustScoreBadge
          score={trustScore}
          streak={loans.filter(l => l.status === 'REPAID').length}
          borrowedTotal={profile ? profile.total_borrowed : '0'}
        />
      </div>

      {/* Main Grid: Application Form vs Loans History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Loan Application Form */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-4.5 h-4.5 text-emerald-400" /> Apply for Microcredit
            </h3>
            <span className="text-[10px] font-mono-data bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
              INSTANT DISBURSAL
            </span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Quick Preset Proofs:</span>
              <span className="text-[10px] text-slate-500">Click to autofill sample</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillSamplePreset('jumia')}
                className="px-2.5 py-1.5 bg-dark-base/80 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/40 rounded-xl text-[11px] text-slate-300 transition-all text-center"
              >
                🛒 Jumia Store
              </button>
              <button
                type="button"
                onClick={() => fillSamplePreset('moniepoint')}
                className="px-2.5 py-1.5 bg-dark-base/80 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/40 rounded-xl text-[11px] text-slate-300 transition-all text-center"
              >
                💳 Moniepoint POS
              </button>
              <button
                type="button"
                onClick={() => fillSamplePreset('utility')}
                className="px-2.5 py-1.5 bg-dark-base/80 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/40 rounded-xl text-[11px] text-slate-300 transition-all text-center"
              >
                ⚡ Utility Bill
              </button>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Merchant / Borrower Name</label>
              <input
                type="text"
                placeholder="e.g. Amina Electronics Store"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +234 802 345 6789"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono-data"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Store / Business URL</label>
              <input
                type="url"
                placeholder="e.g. https://jumia.com.ng/shop/amina-electronics"
                value={shopUrl}
                onChange={e => setShopUrl(e.target.value)}
                className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono-data"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Evidence URL (Screenshot / Revenue Proof)</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              </label>
              <input
                type="url"
                placeholder="e.g. https://raw.githubusercontent.com/evidence/jumia_receipt.png"
                value={evidenceUrl}
                onChange={e => setEvidenceUrl(e.target.value)}
                className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono-data"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Requested Loan ($ GEN)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono-data">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Submit Application to GenLayer AI
            </button>
          </form>
        </div>

        {/* Loan History & Detailed AI Reasoning */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-emerald-400" /> Your Microcredit Applications
            </h3>
            <button
              onClick={fetchBorrowerData}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1.5 border border-white/5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {loans.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl text-center text-slate-400 space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-300">No Applications Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Fill out the application form on the left to trigger GenLayer AI consensus evaluation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map(loan => (
                <div key={loan.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-400 font-mono-data">Loan #{loan.id}</span>
                      <span className={`text-xs px-3 py-0.5 rounded-full font-bold border ${
                        loan.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        loan.status === 'REPAID' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        loan.status === 'DISPUTED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {loan.status}
                      </span>
                    </div>

                    <div className="text-base font-black text-white font-mono-data">
                      ${loan.principal} GEN
                    </div>
                  </div>

                  {/* AI Underwriting Verdict & Explanation */}
                  <div className="bg-dark-base/90 p-4 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Underwriter Verdict:
                      </span>
                      <span className={`text-xs font-bold font-mono-data px-2 py-0.5 rounded ${
                        loan.ai_verdict === 'APPROVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {loan.ai_verdict}
                      </span>
                    </div>

                    {loan.ai_reason && (
                      <p className="text-xs text-slate-300 leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                        "{loan.ai_reason}"
                      </p>
                    )}
                  </div>

                  {/* Evidence Link & Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <a
                      href={loan.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono-data truncate max-w-[200px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{loan.evidence_url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>

                    {loan.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleRepay(loan)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Repay ${Number(loan.principal) * (1 + loan.interest_rate / 10000)} GEN
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
