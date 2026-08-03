import React, { useState, useEffect, useCallback } from 'react';
import { PiggyBank, TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import type { PoolInfo, LenderProfile } from '../types';

interface LenderDashboardProps {
  address: string;
  readContract: (fn: string, args?: any[]) => Promise<any>;
  writeContract: (fn: string, args?: any[], value?: bigint, loadingMsg?: string) => Promise<any>;
}

export const LenderDashboard: React.FC<LenderDashboardProps> = ({
  address,
  readContract,
  writeContract,
}) => {
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('50');

  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [lenderProfile, setLenderProfile] = useState<LenderProfile | null>(null);

  const fetchLenderData = useCallback(async () => {
    if (!address) return;
    try {
      const pData = await readContract('get_pool_info');
      if (pData) {
        setPoolInfo({
          total_pool: String(pData.total_pool || '0'),
          total_loans: Number(pData.total_loans || 0),
          min_loan: String(pData.min_loan || '10'),
          max_loan: String(pData.max_loan || '1000'),
          base_interest_rate: Number(pData.base_interest_rate || 500),
        });
      }

      const lData = await readContract('get_lender_profile', [address]);
      if (lData) {
        setLenderProfile({
          name: lData.name || 'Lender',
          total_deposited: String(lData.total_deposited || '0'),
          total_lent: String(lData.total_lent || '0'),
          total_earned: String(lData.total_earned || '0'),
        });
      }
    } catch (err) {
      console.error('Error fetching lender data:', err);
    }
  }, [address, readContract]);

  useEffect(() => {
    fetchLenderData();
  }, [fetchLenderData]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(depositAmount);
    if (isNaN(val) || val <= 0) return;

    const valWei = BigInt(val);
    const res = await writeContract(
      'deposit',
      [],
      valWei,
      `Depositing ${val} GEN into Microcredit Pool...`
    );

    if (res) fetchLenderData();
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(withdrawAmount);
    if (isNaN(val) || val <= 0) return;

    const res = await writeContract(
      'withdraw',
      [val],
      undefined,
      `Withdrawing ${val} GEN from Pool...`
    );

    if (res) fetchLenderData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Pool Header Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Pool Liquidity</div>
            <div className="text-2xl font-black text-white font-mono-data">${poolInfo ? poolInfo.total_pool : '0'} GEN</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Interest APY Rate</div>
            <div className="text-2xl font-black text-purple-300 font-mono-data">
              {poolInfo ? poolInfo.base_interest_rate / 100 : 5}% APY
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Your Active Stake</div>
            <div className="text-2xl font-black text-blue-300 font-mono-data">
              ${lenderProfile ? lenderProfile.total_deposited : '0'} GEN
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Loans Funded</div>
            <div className="text-2xl font-black text-amber-300 font-mono-data">
              {poolInfo ? poolInfo.total_loans : 0} Loans
            </div>
          </div>
        </div>
      </div>

      {/* Deposit & Withdraw Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Deposit to Microcredit Pool</h3>
              <p className="text-xs text-slate-400">Earn interest yield as GenLayer AI disburses funds to verified merchants.</p>
            </div>
          </div>

          <form onSubmit={handleDeposit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deposit Amount ($ GEN)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 text-xs font-mono-data">$</span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Deposit Liquidity
            </button>
          </form>
        </div>

        {/* Withdraw Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Withdraw Liquidity</h3>
              <p className="text-xs text-slate-400">Withdraw your principal balance plus earned interest at any time.</p>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Withdraw Amount ($ GEN)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500 text-xs font-mono-data">$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-dark-base/90 border border-slate-700/80 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white font-mono-data focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition-all border border-white/10"
            >
              Withdraw Principal & Earnings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
