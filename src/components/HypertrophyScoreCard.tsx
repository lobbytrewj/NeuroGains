import { Award, TrendingUp, Zap, Target, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HypertrophyScoreCardProps {
  score: number;
  totalReps: number;
  hypertrophyReps: number;
  avgVelocityLoss: number;
  peakTremorAvg: number;
  timeUnderNeuralTension: number;
  isVisible: boolean;
  onClose: () => void;
}

export const HypertrophyScoreCard = ({
  score,
  totalReps,
  hypertrophyReps,
  avgVelocityLoss,
  peakTremorAvg,
  timeUnderNeuralTension,
  isVisible,
  onClose
}: HypertrophyScoreCardProps) => {
  const [isDataReady, setIsDataReady] = useState(false);
  const [displayData, setDisplayData] = useState({
    score,
    totalReps,
    hypertrophyReps,
    avgVelocityLoss,
    peakTremorAvg,
    timeUnderNeuralTension
  });

  useEffect(() => {
    if (totalReps === 0 && isVisible) {
      const timer = setTimeout(() => {
        setDisplayData({
          score,
          totalReps,
          hypertrophyReps,
          avgVelocityLoss,
          peakTremorAvg,
          timeUnderNeuralTension
        });
        setIsDataReady(true);
      }, 500);

      return () => clearTimeout(timer);
    } else if (totalReps > 0) {
      setDisplayData({
        score,
        totalReps,
        hypertrophyReps,
        avgVelocityLoss,
        peakTremorAvg,
        timeUnderNeuralTension
      });
      setIsDataReady(true);
    }
  }, [score, totalReps, hypertrophyReps, avgVelocityLoss, peakTremorAvg, timeUnderNeuralTension, isVisible]);

  if (!isVisible) return null;
  if (!isDataReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="flex items-center justify-center">
            <div className="text-cyan-400 text-xl font-mono animate-pulse">
              CALCULATING METRICS...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getScoreRating = (score: number) => {
    if (score >= 90) return { label: 'Elite', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 75) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (score >= 40) return { label: 'Fair', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { label: 'Needs Work', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const rating = getScoreRating(displayData.score);
  const efficiencyPercent = displayData.totalReps > 0 ? (displayData.hypertrophyReps / displayData.totalReps) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${rating.bg}`}>
              <Award className={`w-8 h-8 ${rating.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Set Complete</h2>
              <p className="text-slate-400">Hypertrophy Analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Hypertrophy Efficiency Score</span>
            <span className={`text-sm font-bold ${rating.color}`}>{rating.label}</span>
          </div>
          <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(100, displayData.score)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className={`text-4xl font-black ${rating.color}`}>{Math.round(displayData.score)}</span>
            <span className="text-slate-400 text-xl">/100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400 font-medium">Total Reps</span>
            </div>
            <p className="text-2xl font-bold text-white">{displayData.totalReps}</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-400 font-medium">Effective Reps</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{displayData.hypertrophyReps}</p>
            <p className="text-xs text-slate-500 mt-1">
              {Math.round(efficiencyPercent)}% efficiency
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400 font-medium">Neural Tension</span>
            </div>
            <p className="text-2xl font-bold text-white">{displayData.timeUnderNeuralTension}s</p>
            <p className="text-xs text-slate-500 mt-1">
              Time in optimal zone
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-slate-400 font-medium">Velocity Loss</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(displayData.avgVelocityLoss * 100)}%</p>
            <p className="text-xs text-slate-500 mt-1">
              {displayData.avgVelocityLoss >= 0.3 ? 'Optimal fatigue' : 'Room for more'}
            </p>
          </div>
        </div>

        <div className={`${rating.bg} border border-current ${rating.color} rounded-xl p-4`}>
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Performance Insights
          </h3>
          <p className="text-sm leading-relaxed">
            {displayData.score >= 75 ? (
              <>Your set demonstrates excellent mechanical tension and motor unit recruitment. You stopped at the optimal point before systemic fatigue compromised recovery.</>
            ) : displayData.score >= 60 ? (
              <>Good effort. Consider pushing closer to failure while monitoring tremor frequency to maximize growth stimulus.</>
            ) : (
              <>Focus on maintaining form while pushing into the 8-12Hz tremor zone. This indicates maximum motor unit taxation without excess fatigue.</>
            )}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Continue Training
        </button>
      </div>
    </div>
  );
};
