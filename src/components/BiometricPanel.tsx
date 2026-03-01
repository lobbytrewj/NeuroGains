import { Brain, Zap, Target } from 'lucide-react';

interface BiometricPanelProps {
  stability: number;
  tremor: number;
  jitterFrequency: number;
  isConnected: boolean;
}

export const BiometricPanel = ({ stability, tremor, jitterFrequency, isConnected }: BiometricPanelProps) => {
  return (
    <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
          Biometric Telemetry
        </h3>
        <div className={`ml-auto px-3 py-1 rounded text-xs font-mono ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {isConnected ? 'LIVE' : 'SIMULATED'}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-950/50 rounded p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
              Neural Stability
            </div>
          </div>
          <div className="text-white font-mono text-3xl">
            {stability.toFixed(2)}%
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                stability > 85 ? 'bg-cyan-500' : stability > 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${stability}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/50 rounded p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
              Muscle Tremor Index
            </div>
          </div>
          <div className="text-white font-mono text-3xl">
            {tremor.toFixed(3)}
          </div>
          <div className="text-slate-400 font-mono text-xs mt-1">
            @ {jitterFrequency.toFixed(1)} Hz
          </div>
        </div>
      </div>
    </div>
  );
};
