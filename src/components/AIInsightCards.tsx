import { Brain, Zap, Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AIInsightCardsProps {
  sessions: any[];
}

export const AIInsightCards = ({ sessions }: AIInsightCardsProps) => {
  const getNeuraEfficiency = () => {
    if (sessions.length === 0) {
      return { score: 0, status: 'No Data', trend: 'stable', color: 'slate' };
    }

    const recent = sessions.slice(0, 3);
    const avgHypertrophy = recent.reduce((sum, s) => sum + (s.hypertrophy_efficiency_score || 0), 0) / recent.length;

    let status = 'Poor';
    let color = 'red';

    if (avgHypertrophy >= 85) {
      status = 'Excellent';
      color = 'emerald';
    } else if (avgHypertrophy >= 70) {
      status = 'Good';
      color = 'cyan';
    } else if (avgHypertrophy >= 50) {
      status = 'Moderate';
      color = 'amber';
    }

    const trend = sessions.length > 3 ?
      (avgHypertrophy > (sessions[3].hypertrophy_efficiency_score || 0) ? 'up' :
       avgHypertrophy < (sessions[3].hypertrophy_efficiency_score || 0) ? 'down' : 'stable') : 'stable';

    return { score: Math.round(avgHypertrophy), status, trend, color };
  };

  const getMotorUnitTaxation = () => {
    if (sessions.length === 0) {
      return { level: 0, status: 'No Data', trend: 'stable', color: 'slate' };
    }

    const recent = sessions.slice(0, 3);
    const avgFatigue = recent.reduce((sum, s) => sum + (s.peak_fatigue || 0), 0) / recent.length;

    let status = 'Optimal';
    let color = 'emerald';

    if (avgFatigue >= 70) {
      status = 'High Taxation';
      color = 'red';
    } else if (avgFatigue >= 50) {
      status = 'Moderate';
      color = 'amber';
    } else if (avgFatigue >= 30) {
      status = 'Low-Moderate';
      color = 'cyan';
    }

    const trend = sessions.length > 3 ?
      (avgFatigue > (sessions[3].peak_fatigue || 0) ? 'up' :
       avgFatigue < (sessions[3].peak_fatigue || 0) ? 'down' : 'stable') : 'stable';

    return { level: Math.round(avgFatigue), status, trend, color };
  };

  const getRecoveryStatus = () => {
    if (sessions.length === 0) {
      return { recommendation: 'Ready', detail: 'No sessions recorded', color: 'emerald', icon: Heart };
    }

    const recent = sessions.slice(0, 3);
    const avgFatigue = recent.reduce((sum, s) => sum + (s.peak_fatigue || 0), 0) / recent.length;
    const avgStability = recent.reduce((sum, s) => sum + (s.average_stability || 0), 0) / recent.length;

    if (avgFatigue > 65 || avgStability < 60) {
      return {
        recommendation: 'Rest Needed',
        detail: 'High CNS fatigue detected',
        color: 'red',
        icon: Heart,
      };
    } else if (avgFatigue > 45 || avgStability < 75) {
      return {
        recommendation: 'Light Training',
        detail: 'Moderate fatigue levels',
        color: 'amber',
        icon: Heart,
      };
    } else {
      return {
        recommendation: 'Ready to Train',
        detail: 'Optimal recovery state',
        color: 'emerald',
        icon: Heart,
      };
    }
  };

  const efficiency = getNeuraEfficiency();
  const taxation = getMotorUnitTaxation();
  const recovery = getRecoveryStatus();

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { text: string; bg: string; border: string }> = {
      emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
      cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
      amber: { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
      red: { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
      slate: { text: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-950 rounded-lg border border-slate-800 p-6 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
            Neural Efficiency
          </h3>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div className={`text-4xl font-mono font-bold ${getColorClasses(efficiency.color).text}`}>
            {efficiency.score}
          </div>
          <div className={getColorClasses(efficiency.color).text}>
            {getTrendIcon(efficiency.trend)}
          </div>
        </div>

        <div className={`rounded px-3 py-2 border ${getColorClasses(efficiency.color).bg} ${getColorClasses(efficiency.color).border}`}>
          <span className={`font-mono text-sm font-bold ${getColorClasses(efficiency.color).text}`}>
            {efficiency.status}
          </span>
        </div>

        <div className="mt-4 text-slate-400 font-mono text-xs">
          Hypertrophy Efficiency Score
        </div>
      </div>

      <div className="bg-slate-950 rounded-lg border border-slate-800 p-6 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/10">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-amber-400 font-mono text-xs uppercase tracking-wider">
            Motor Unit Taxation
          </h3>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div className={`text-4xl font-mono font-bold ${getColorClasses(taxation.color).text}`}>
            {taxation.level}%
          </div>
          <div className={getColorClasses(taxation.color).text}>
            {getTrendIcon(taxation.trend)}
          </div>
        </div>

        <div className={`rounded px-3 py-2 border ${getColorClasses(taxation.color).bg} ${getColorClasses(taxation.color).border}`}>
          <span className={`font-mono text-sm font-bold ${getColorClasses(taxation.color).text}`}>
            {taxation.status}
          </span>
        </div>

        <div className="mt-4 text-slate-400 font-mono text-xs">
          CNS Fatigue Level
        </div>
      </div>

      <div className="bg-slate-950 rounded-lg border border-slate-800 p-6 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
        <div className="flex items-center gap-2 mb-4">
          <recovery.icon className="w-5 h-5 text-emerald-400" />
          <h3 className="text-emerald-400 font-mono text-xs uppercase tracking-wider">
            Recovery Status
          </h3>
        </div>

        <div className="mb-3">
          <div className={`text-2xl font-mono font-bold ${getColorClasses(recovery.color).text} mb-2`}>
            {recovery.recommendation}
          </div>
        </div>

        <div className={`rounded px-3 py-2 border ${getColorClasses(recovery.color).bg} ${getColorClasses(recovery.color).border}`}>
          <span className={`font-mono text-sm ${getColorClasses(recovery.color).text}`}>
            {recovery.detail}
          </span>
        </div>

        <div className="mt-4 text-slate-400 font-mono text-xs">
          Training Readiness
        </div>
      </div>
    </div>
  );
};
