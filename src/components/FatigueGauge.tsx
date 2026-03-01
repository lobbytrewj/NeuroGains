import { Activity } from 'lucide-react';

interface FatigueGaugeProps {
  fatigue: number;
  jitterFrequency: number;
}

export const FatigueGauge = ({ fatigue, jitterFrequency }: FatigueGaugeProps) => {
  const getFatigueColor = (value: number) => {
    if (value < 30) return 'bg-cyan-500';
    if (value < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getFatigueStatus = (value: number) => {
    if (value < 30) return 'OPTIMAL';
    if (value < 60) return 'MODERATE';
    return 'HIGH';
  };

  return (
    <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
          Neural Fatigue Index
        </h3>
      </div>

      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div className="text-white font-mono text-4xl">
            {fatigue.toFixed(0)}%
          </div>
          <div className={`font-mono text-sm px-3 py-1 rounded ${
            fatigue < 30 ? 'bg-cyan-500/20 text-cyan-400' :
            fatigue < 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {getFatigueStatus(fatigue)}
          </div>
        </div>

        <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getFatigueColor(fatigue)} transition-all duration-300`}
            style={{ width: `${Math.min(100, fatigue)}%` }}
          />
          <div className="absolute inset-0 flex items-center">
            <div className="w-1/3 border-r border-slate-700 h-full"></div>
            <div className="w-1/3 border-r border-slate-700 h-full"></div>
          </div>
        </div>

        <div className="flex justify-between text-xs font-mono text-slate-500 mt-1">
          <span>0%</span>
          <span>30%</span>
          <span>60%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950/50 rounded p-3 border border-slate-700">
          <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            Tremor Frequency
          </div>
          <div className="text-white font-mono text-xl">
            {jitterFrequency.toFixed(1)} Hz
          </div>
        </div>

        <div className="bg-slate-950/50 rounded p-3 border border-slate-700">
          <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            Status
          </div>
          <div className={`font-mono text-xl ${
            jitterFrequency < 5 ? 'text-cyan-400' : 'text-red-400'
          }`}>
            {jitterFrequency < 5 ? 'STABLE' : 'TREMOR'}
          </div>
        </div>
      </div>
    </div>
  );
};
