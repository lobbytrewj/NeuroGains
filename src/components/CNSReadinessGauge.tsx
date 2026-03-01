import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';

interface CNSReadinessGaugeProps {
  sessions: any[];
}

export const CNSReadinessGauge = ({ sessions }: CNSReadinessGaugeProps) => {
  const [readiness, setReadiness] = useState(0);
  const [status, setStatus] = useState('');
  const [avgFatigue, setAvgFatigue] = useState(0);

  useEffect(() => {
    if (sessions.length === 0) {
      setReadiness(100);
      setStatus('Ready');
      setAvgFatigue(0);
      return;
    }

    const recentSessions = sessions.slice(0, 5);
    const totalFatigue = recentSessions.reduce((sum, s) => sum + (s.peak_fatigue || 0), 0);
    const avgFatigueValue = totalFatigue / recentSessions.length;

    setAvgFatigue(Math.round(avgFatigueValue));

    let readinessValue = 100;
    let statusText = 'Optimal';

    if (avgFatigueValue > 60) {
      readinessValue = 30;
      statusText = 'Low - Recovery Advised';
    } else if (avgFatigueValue > 40) {
      readinessValue = 60;
      statusText = 'Moderate';
    } else if (avgFatigueValue > 20) {
      readinessValue = 85;
      statusText = 'Good';
    } else {
      readinessValue = 95;
      statusText = 'Optimal';
    }

    setReadiness(readinessValue);
    setStatus(statusText);
  }, [sessions]);

  const getStatusColor = () => {
    if (readiness >= 80) return 'text-emerald-400';
    if (readiness >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusBgColor = () => {
    if (readiness >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (readiness >= 50) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const rotation = -90 + (readiness / 100) * 180;

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
          CNS Daily Readiness
        </h3>
      </div>

      <div className="relative flex items-center justify-center mb-4">
        <svg className="w-48 h-24" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="rgb(30, 41, 59)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={
              readiness >= 80 ? 'rgb(52, 211, 153)' :
              readiness >= 50 ? 'rgb(251, 191, 36)' :
              'rgb(248, 113, 113)'
            }
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${readiness * 2.51} 251`}
            className="transition-all duration-1000 ease-out"
          />
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="30"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation}, 100, 80)`}
            className="transition-all duration-1000 ease-out"
          />
          <circle cx="100" cy="80" r="5" fill="white" />
        </svg>
        <div className="absolute bottom-0 text-center">
          <div className={`text-4xl font-mono font-bold ${getStatusColor()}`}>
            {readiness}%
          </div>
        </div>
      </div>

      <div className={`rounded-lg border p-3 ${getStatusBgColor()} mb-3`}>
        <div className="flex items-center gap-2 justify-center">
          {readiness < 50 && <AlertTriangle className="w-4 h-4" />}
          {readiness >= 80 && <TrendingUp className="w-4 h-4" />}
          <span className={`font-mono text-sm font-bold ${getStatusColor()}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-slate-900/50 rounded p-2 border border-slate-800">
          <div className="text-slate-400 font-mono text-xs mb-1">Avg Fatigue</div>
          <div className="text-white font-mono font-bold">{avgFatigue}%</div>
        </div>
        <div className="bg-slate-900/50 rounded p-2 border border-slate-800">
          <div className="text-slate-400 font-mono text-xs mb-1">Recent Sessions</div>
          <div className="text-white font-mono font-bold">{Math.min(sessions.length, 5)}</div>
        </div>
      </div>
    </div>
  );
};
