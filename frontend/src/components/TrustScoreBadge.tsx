import React from 'react';
import { ShieldCheck, Zap, Award, Lock } from 'lucide-react';

interface TrustScoreBadgeProps {
  score: number;
  streak: number;
  borrowedTotal: string;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({ score, streak, borrowedTotal }) => {
  const getTierInfo = (val: number) => {
    if (val >= 80) return { name: 'Diamond Tier', limit: '$1,000', color: 'from-amber-400 to-yellow-500 text-amber-900 border-amber-400/40', bg: 'bg-amber-500/10 text-amber-400' };
    if (val >= 60) return { name: 'Gold Tier', limit: '$500', color: 'from-emerald-400 to-teal-500 text-emerald-950 border-emerald-400/40', bg: 'bg-emerald-500/10 text-emerald-400' };
    if (val >= 40) return { name: 'Silver Tier', limit: '$250', color: 'from-slate-300 to-slate-400 text-slate-900 border-slate-300/40', bg: 'bg-slate-500/10 text-slate-300' };
    return { name: 'Bronze Tier', limit: '$100', color: 'from-amber-700 to-orange-700 text-white border-amber-600/40', bg: 'bg-amber-800/10 text-amber-500' };
  };

  const tier = getTierInfo(score);
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
      {/* Background Ambient Glow */}
      <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">Soulbound Reputation</h3>
              <span className="text-[10px] font-mono-data px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">SBT ON-CHAIN</span>
            </div>
            <p className="text-[11px] text-slate-400">Non-Transferable Credit Rating</p>
          </div>
        </div>

        <span className={`text-[11px] px-3 py-1 rounded-full font-bold border shadow-sm ${tier.bg}`}>
          {tier.name}
        </span>
      </div>

      {/* Center Score & Radial Meter */}
      <div className="my-4 flex items-center justify-around gap-4">
        {/* Radial SVG Gauge */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white font-mono-data leading-none">{score}</span>
            <span className="text-[9px] text-slate-400 font-medium">/ 100 SCORE</span>
          </div>
        </div>

        {/* Stats Summary Column */}
        <div className="flex-1 space-y-2">
          <div className="bg-dark-base/80 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Repay Streak</span>
            </div>
            <span className="text-xs font-bold text-amber-400 font-mono-data">{streak} Loans 🔥</span>
          </div>

          <div className="bg-dark-base/80 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Credit Limit</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono-data">{tier.limit}</span>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="pt-2 border-t border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" /> Total Borrowed: ${borrowedTotal}
          </span>
          <span className="font-mono-data text-amber-400 font-semibold">{score}/80 Score</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (score / 80) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
