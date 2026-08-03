import React, { useState } from 'react';
import { Scale, AlertTriangle, FileWarning, Sparkles, CheckCircle2, ShieldAlert, AlertOctagon } from 'lucide-react';
import type { Loan } from '../types';

interface DisputePanelProps {
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const DisputePanel: React.FC<DisputePanelProps> = ({
  readContract,
  writeContract,
}) => {
  const [loanId, setLoanId] = useState('1');
  const [evidenceUrl, setEvidenceUrl] = useState('https://raw.githubusercontent.com/evidence/hospital_admission_record.pdf');
  const [reason, setReason] = useState('Emergency hospitalization following road accident. Medical certificate attached.');
  const [disputedLoan, setDisputedLoan] = useState<Loan | null>(null);

  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanId || !evidenceUrl || !reason) {
      alert('Please fill out all dispute fields.');
      return;
    }

    const res = await writeContract(
      'file_dispute',
      [loanId, evidenceUrl, reason],
      undefined,
      'Filing dispute to GenLayer AI Arbitration Court...'
    );

    if (res) {
      fetchDisputeDetails();
    }
  };

  const fetchDisputeDetails = async () => {
    if (!loanId) return;
    try {
      const lData = await readContract('get_loan', [loanId]);
      if (lData) {
        setDisputedLoan({
          id: loanId,
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
    } catch (err) {
      console.error('Error fetching dispute details:', err);
    }
  };

  const fillSampleDispute = (type: 'medical' | 'fire' | 'liquidity') => {
    if (type === 'medical') {
      setReason('Emergency hospitalization following road accident. Medical certificate attached.');
      setEvidenceUrl('https://raw.githubusercontent.com/evidence/hospital_admission_record.pdf');
    } else if (type === 'fire') {
      setReason('Market stall fire damage proof confirmed by police report.');
      setEvidenceUrl('https://raw.githubusercontent.com/evidence/police_fire_report.png');
    } else {
      setReason('Temporary liquidity hardship due to delayed inventory supplier delivery.');
      setEvidenceUrl('https://raw.githubusercontent.com/evidence/supplier_delay_letter.pdf');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
        <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <Scale className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">GenLayer AI Arbitration Court</h2>
          <p className="text-sm text-slate-400 leading-relaxed mt-1">
            Automated subjective dispute resolution. When a borrower faces default, GenLayer AI validators examine proof of hardship (medical certificates, accident reports, disaster proofs) to distinguish <strong>Force Majeure</strong> vs <strong>Fraudulent Default</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dispute Form */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileWarning className="w-4.5 h-4.5 text-amber-400" /> File Dispute / Hardship Claim
          </h3>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-400">Sample Hardship Claims:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillSampleDispute('medical')}
                className="px-2 py-1.5 bg-dark-base/80 hover:bg-slate-800 border border-white/5 hover:border-amber-500/40 rounded-xl text-[11px] text-slate-300 transition-all text-center"
              >
                🏥 Hospital Proof
              </button>
              <button
                type="button"
                onClick={() => fillSampleDispute('fire')}
                className="px-2 py-1.5 bg-dark-base/80 hover:bg-slate-800 border border-white/5 hover:border-amber-500/40 rounded-xl text-[11px] text-slate-300 transition-all text-center"
              >
                🔥 Fire/Disaster
              </button>
              <button
                type="button"
                onClick={() => fillSampleDispute('liquidity')}
                className="px-2 py-1.5 bg-dark-base/80 hover:bg-slate-800 border border-white/5 hover:border-amber-500/40 rounded-xl text-[11px] text-slate-300 transition-all text-center"
              >
                📦 Supplier Delay
              </button>
            </div>
          </div>

          <form onSubmit={handleFileDispute} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Loan ID</label>
              <input
                type="text"
                placeholder="e.g. 1"
                value={loanId}
                onChange={e => setLoanId(e.target.value)}
                className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dispute Proof / Evidence URL</label>
              <input
                type="url"
                placeholder="e.g. https://evidence-storage.com/hospital_bill.pdf"
                value={evidenceUrl}
                onChange={e => setEvidenceUrl(e.target.value)}
                className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Claim Justification / Statement</label>
              <textarea
                rows={3}
                placeholder="Describe why default occurred or why dispute is filed..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-sans focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Submit Evidence to AI Arbitration
            </button>
          </form>
        </div>

        {/* Dispute Verdict Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" /> AI Arbitration Verdict Result
            </h3>
            <button
              onClick={fetchDisputeDetails}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 border border-white/5"
            >
              Lookup Loan #{loanId}
            </button>
          </div>

          {disputedLoan ? (
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Loan #{disputedLoan.id} Status:</span>
                  <div className="text-lg font-bold text-white font-mono-data">{disputedLoan.status}</div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Arbitration Verdict:</span>
                  <div className={`text-base font-black font-mono-data ${
                    disputedLoan.dispute_verdict === 'FORCE_MAJEURE' ? 'text-emerald-400' :
                    disputedLoan.dispute_verdict === 'HONEST_DEFAULT' ? 'text-amber-400' :
                    disputedLoan.dispute_verdict === 'FRAUD' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {disputedLoan.dispute_verdict || 'NO DISPUTE RECORDED'}
                  </div>
                </div>
              </div>

              {/* Verdict Explanation Box */}
              <div className="bg-dark-base p-4 rounded-xl border border-white/5 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Consensus Reasoning:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic bg-black/30 p-3 rounded-lg border border-white/5">
                  {disputedLoan.ai_reason || 'No arbitration verdict issued yet for this loan.'}
                </p>
              </div>

              {/* Action Resolution Explanations */}
              <div className="text-xs text-slate-400 space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>FORCE_MAJEURE:</strong> 30-day interest freeze & due date extension applied.</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>HONEST_DEFAULT:</strong> 15-day grace period extension granted.</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span><strong>FRAUD:</strong> Soulbound trust score penalized (-25 points) and streak reset.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-10 rounded-2xl text-center text-slate-400 space-y-2">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <p>Enter a Loan ID and click "Lookup Loan" to inspect arbitration details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
