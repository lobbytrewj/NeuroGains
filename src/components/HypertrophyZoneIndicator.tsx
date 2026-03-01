import { TrendingUp } from 'lucide-react';

interface HypertrophyZoneIndicatorProps {
  progress: number;
  isActive: boolean;
  velocityLoss?: number;
  isCalibrated?: boolean;
}

export const HypertrophyZoneIndicator = ({
  progress,
  isActive,
  velocityLoss = 0,
  isCalibrated = false
}: HypertrophyZoneIndicatorProps) => {
  const getZoneInfo = () => {
    if (!isCalibrated) {
      return {
        label: 'Analyzing Pattern...',
        color: 'from-slate-400 to-slate-600',
        bgColor: 'bg-slate-500/20',
        textColor: 'text-slate-400',
        glowEffect: false
      };
    }

    if (velocityLoss >= 0.35) {
      return {
        label: 'Neural Failure - LAST REP',
        color: 'from-yellow-400 via-amber-500 to-yellow-600',
        bgColor: 'bg-yellow-500/30',
        textColor: 'text-yellow-400',
        glowEffect: true
      };
    } else if (velocityLoss >= 0.20) {
      return {
        label: 'Peak Hypertrophy Zone',
        color: 'from-orange-400 to-orange-600',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        glowEffect: false
      };
    } else if (velocityLoss >= 0.10) {
      return {
        label: 'Effective Training Zone',
        color: 'from-cyan-400 to-cyan-600',
        bgColor: 'bg-cyan-500/20',
        textColor: 'text-cyan-400',
        glowEffect: false
      };
    } else {
      return {
        label: 'Warming Up',
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400',
        glowEffect: false
      };
    }
  };

  const zone = getZoneInfo();
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
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${zone.color} transition-all duration-300 ease-out ${
              zone.glowEffect ? 'shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-pulse' : ''
            }`}
            style={{ height: `${clampedProgress}%` }}
          >
            <div className={`absolute inset-0 ${zone.glowEffect ? 'bg-white/20 animate-pulse' : 'bg-white/10'}`}></div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-between py-3 px-3 pointer-events-none">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">100%</span>
              <span className="text-xs font-medium text-yellow-400/60">35% VL - Failure</span>
            </div>

            <div className="flex items-center justify-between border-t border-yellow-500/50 pt-1">
              <span className="text-xs text-slate-500">70%</span>
              <span className="text-xs font-medium text-yellow-400/60">LAST REP</span>
            </div>

            <div className="flex-1 flex items-center">
              <div className="w-full border-t border-orange-500/40"></div>
            </div>

            <div className="flex items-center justify-between border-t border-orange-500/30 pt-1">
              <span className="text-xs text-slate-500">40%</span>
              <span className="text-xs font-medium text-orange-400/60">20% VL - Peak Zone</span>
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

      {isActive && isCalibrated && velocityLoss >= 0.20 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${velocityLoss >= 0.35 ? 'bg-yellow-400' : 'bg-orange-400'}`}></div>
          <span className={`text-sm font-medium ${velocityLoss >= 0.35 ? 'text-yellow-400' : 'text-orange-400'}`}>
            {velocityLoss >= 0.35 ? 'Neural Failure Zone' : 'Peak Hypertrophy Stimulus'}
          </span>
        </div>
      )}
    </div>
  );
};
