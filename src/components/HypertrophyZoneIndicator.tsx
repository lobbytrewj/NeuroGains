import { TrendingUp } from 'lucide-react';

interface HypertrophyZoneIndicatorProps {
  progress: number;
  isActive: boolean;
}

export const HypertrophyZoneIndicator = ({ progress, isActive }: HypertrophyZoneIndicatorProps) => {
  const getZoneInfo = (progress: number) => {
    if (progress < 60) {
      return {
        label: 'Warming Up',
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400'
      };
    } else if (progress < 90) {
      return {
        label: 'Effective Hypertrophy Zone',
        color: 'from-yellow-400 to-amber-500',
        bgColor: 'bg-yellow-500/20',
        textColor: 'text-yellow-400'
      };
    } else {
      return {
        label: 'Neural Failure Imminent',
        color: 'from-red-500 to-rose-600',
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-400'
      };
    }
  };

  const zone = getZoneInfo(progress);
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${zone.bgColor}`}>
          <TrendingUp className={`w-5 h-5 ${zone.textColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400">Hypertrophy Progress</h3>
          <p className={`text-lg font-bold ${zone.textColor}`}>{zone.label}</p>
        </div>
      </div>

      <div className="relative">
        <div className="h-64 bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/50">
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${zone.color} transition-all duration-300 ease-out`}
            style={{ height: `${clampedProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-between py-3 px-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">100%</span>
              <span className="text-xs font-medium text-red-400/60">Neural Failure</span>
            </div>

            <div className="flex items-center justify-between border-t border-red-500/30 pt-1">
              <span className="text-xs text-slate-500">90%</span>
            </div>

            <div className="flex-1 flex items-center">
              <div className="w-full border-t border-yellow-500/40"></div>
            </div>

            <div className="flex items-center justify-between border-t border-yellow-500/30 pt-1">
              <span className="text-xs text-slate-500">60%</span>
              <span className="text-xs font-medium text-yellow-400/60">Hypertrophy Zone</span>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center justify-between border-t border-blue-500/30 pt-1">
              <span className="text-xs text-slate-500">0%</span>
              <span className="text-xs font-medium text-blue-400/60">Warm-up</span>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 -translate-y-8 text-center">
          <div className={`inline-block px-4 py-2 rounded-lg ${zone.bgColor} border ${zone.textColor} border-current`}>
            <span className="text-2xl font-bold">{Math.round(clampedProgress)}%</span>
          </div>
        </div>
      </div>

      {!isActive && (
        <div className="mt-4 text-center text-sm text-slate-500">
          Start a session to track your progress
        </div>
      )}

      {isActive && clampedProgress >= 60 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          <span className="text-sm font-medium text-yellow-400">
            Maximum Growth Stimulus Active
          </span>
        </div>
      )}
    </div>
  );
};
