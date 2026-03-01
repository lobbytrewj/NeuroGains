import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, TrendingUp, Activity, Clock, Zap, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { useState } from 'react';

interface SessionData {
  id: string;
  date: string;
  duration: string;
  reps: number;
  hypertrophyScore: number;
  stabilityScore: number;
  timeSeriesData: Array<{
    timestamp: number;
    stability: number;
    tremor: number;
    velocity: number;
    jitter: number;
  }>;
  failureSnapshot?: {
    joint: string;
    tremor: number;
    timestamp: number;
    posture: string;
  };
  effectiveReps: number;
  timeUnderNeuralTension: number;
  allTimeBestStability: number;
}

interface SessionDeepDiveProps {
  session: SessionData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionDeepDive: React.FC<SessionDeepDiveProps> = ({ session, isOpen, onClose }) => {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!session) return null;

  const handleExportData = () => {
    const exportData = {
      session_id: session.id,
      timestamp: new Date().toISOString(),
      metrics: {
        duration: session.duration,
        total_reps: session.reps,
        effective_reps: session.effectiveReps,
        hypertrophy_score: session.hypertrophyScore,
        stability_score: session.stabilityScore,
        time_under_neural_tension_seconds: session.timeUnderNeuralTension,
      },
      time_series: session.timeSeriesData,
      failure_analysis: session.failureSnapshot,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroform-session-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentDataPoint = session.timeSeriesData[Math.floor(currentTimestamp / 100)] || session.timeSeriesData[0];

  const getFatigueColor = (timestamp: number) => {
    const progress = timestamp / (session.timeSeriesData.length * 100);
    if (progress < 0.3) return '#06b6d4';
    if (progress < 0.6) return '#f59e0b';
    if (progress < 0.8) return '#f97316';
    return '#ef4444';
  };

  const recoveryStatus = session.stabilityScore >= session.allTimeBestStability - 5 ? 'Optimal' :
                        session.stabilityScore >= session.allTimeBestStability - 15 ? 'Recovering' :
                        'Overtraining Risk';

  const recoveryColor = recoveryStatus === 'Optimal' ? 'text-green-400' :
                        recoveryStatus === 'Recovering' ? 'text-yellow-400' :
                        'text-red-400';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 max-w-7xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-1">Session Deep Dive</h2>
                <p className="text-slate-400 text-sm">{session.date} • {session.duration}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors border border-cyan-500/30"
                >
                  <Download size={18} />
                  Export Neuro-Data
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Time-Series Playback */}
              <div className="bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                    <Activity size={24} />
                    Motor Cortex Firing Consistency
                  </h3>
                  <div className="text-sm text-slate-400">
                    Timestamp: <span className="text-cyan-400 font-mono">{currentTimestamp}ms</span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={session.timeSeriesData}>
                    <defs>
                      <linearGradient id="stabilityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="tremorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#64748b"
                      label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #06b6d4',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                    />
                    <ReferenceLine
                      x={currentTimestamp}
                      stroke="#06b6d4"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="stability"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      name="Stability"
                    />
                    <Line
                      type="monotone"
                      dataKey="tremor"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      dot={false}
                      name="Tremor (Hz)"
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-3">
                  <input
                    type="range"
                    min="0"
                    max={(session.timeSeriesData.length - 1) * 100}
                    value={currentTimestamp}
                    onChange={(e) => setCurrentTimestamp(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />

                  <div className="flex gap-4 items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold rounded-lg transition-colors"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Stability: </span>
                        <span className="text-cyan-400 font-bold">{currentDataPoint.stability.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Tremor: </span>
                        <span className="text-yellow-400 font-bold">{currentDataPoint.tremor.toFixed(1)}Hz</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Velocity: </span>
                        <span className="text-purple-400 font-bold">{currentDataPoint.velocity.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neurological Fatigue Gradient */}
              <div className="bg-slate-800/50 rounded-xl border border-amber-500/20 p-6">
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-4">
                  <TrendingUp size={24} />
                  Neurological Fatigue Progression
                </h3>
                <div className="relative h-16 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to right, #06b6d4 0%, #f59e0b 40%, #f97316 70%, #ef4444 100%)'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-slate-900 font-bold text-sm">
                    <span>Fresh CNS</span>
                    <span>Optimal Zone</span>
                    <span>Fatigue Rising</span>
                    <span>Neural Failure</span>
                  </div>
                </div>
                <div className="mt-3 text-center text-slate-400 text-sm">
                  Gradient represents central nervous system state from fresh to exhausted
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hypertrophy Analysis */}
                <div className="bg-gradient-to-br from-amber-900/20 to-slate-800/50 rounded-xl border border-amber-500/30 p-6">
                  <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-4">
                    <Zap size={24} />
                    Hypertrophy Analysis
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Effective Rep Count</div>
                      <div className="text-3xl font-bold text-amber-400">
                        {session.effectiveReps} <span className="text-lg text-slate-400">/ {session.reps}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        High-tension, optimal tremor reps
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Time Under Neural Tension (TUNT)</div>
                      <div className="text-3xl font-bold text-amber-400 flex items-center gap-2">
                        <Clock size={28} />
                        {session.timeUnderNeuralTension}s
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Time in 8-12Hz tremor frequency range
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Hypertrophy Efficiency</div>
                      <div className="text-3xl font-bold text-amber-400">
                        {session.hypertrophyScore}%
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${session.hypertrophyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Neural Failure Snapshot */}
                <div className="bg-slate-800/50 rounded-xl border border-red-500/30 p-6">
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
                    <AlertTriangle size={24} />
                    Neural Failure Snapshot
                  </h3>

                  {session.failureSnapshot ? (
                    <div className="space-y-4">
                      <div className="bg-slate-900 rounded-lg p-4 border border-red-500/20">
                        <div className="text-center mb-4">
                          <div className="text-6xl mb-2">🦾</div>
                          <div className="text-sm text-slate-400">Failure Point Visualization</div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Critical Joint:</span>
                            <span className="text-red-400 font-bold uppercase">{session.failureSnapshot.joint}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Peak Tremor:</span>
                            <span className="text-red-400 font-bold">{session.failureSnapshot.tremor.toFixed(1)}Hz</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Failure Time:</span>
                            <span className="text-red-400 font-bold">{session.failureSnapshot.timestamp}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Posture:</span>
                            <span className="text-slate-300">{session.failureSnapshot.posture}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-900/20 rounded-lg p-3 text-xs text-red-300 border border-red-500/20">
                        <strong>Analysis:</strong> Motor unit recruitment exceeded capacity at {session.failureSnapshot.joint}.
                        CNS protection mechanism triggered final rep alert to prevent injury.
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-8">
                      No failure point detected in this session
                    </div>
                  )}
                </div>
              </div>

              {/* Comparative Analysis */}
              <div className="bg-slate-800/50 rounded-xl border border-cyan-500/20 p-6">
                <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2 mb-4">
                  <TrendingUp size={24} />
                  Comparative Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4 border border-cyan-500/20">
                    <div className="text-sm text-slate-400 mb-1">This Session</div>
                    <div className="text-3xl font-bold text-cyan-400">{session.stabilityScore}%</div>
                    <div className="text-xs text-slate-500 mt-1">Stability Score</div>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4 border border-green-500/20">
                    <div className="text-sm text-slate-400 mb-1">All-Time Best</div>
                    <div className="text-3xl font-bold text-green-400">{session.allTimeBestStability}%</div>
                    <div className="text-xs text-slate-500 mt-1">Peak Stability</div>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-sm text-slate-400 mb-1">CNS Recovery Status</div>
                    <div className={`text-2xl font-bold ${recoveryColor}`}>{recoveryStatus}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {session.stabilityScore >= session.allTimeBestStability - 5
                        ? 'CNS fully recovered'
                        : session.stabilityScore >= session.allTimeBestStability - 15
                        ? 'Allow 24-48h recovery'
                        : 'Extended rest recommended'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-2">Performance Trend</div>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={[
                      { name: 'Prev-2', value: session.allTimeBestStability - 8 },
                      { name: 'Prev-1', value: session.allTimeBestStability - 3 },
                      { name: 'Best', value: session.allTimeBestStability },
                      { name: 'Current', value: session.stabilityScore }
                    ]}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="url(#trendGradient)" strokeWidth={2} />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis domain={[70, 100]} stroke="#64748b" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
