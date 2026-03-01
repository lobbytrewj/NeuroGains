import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Activity, Zap, Target, Clock, ArrowRight } from 'lucide-react';
import { supabase, Session } from '../lib/supabase';
import { SessionDeepDive } from '../components/SessionDeepDive';
import { CNSReadinessGauge } from '../components/CNSReadinessGauge';
import { NeuralTrendChart } from '../components/NeuralTrendChart';
import { AIInsightCards } from '../components/AIInsightCards';
import { ExerciseHeatmap } from '../components/ExerciseHeatmap';

export const HomePage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgStability: 0,
    totalDuration: 0,
    bestStability: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading sessions:', error);
        setLoading(false);
        return;
      }

      setSessions(data || []);

      if (data && data.length > 0) {
        const avgStability = data.reduce((sum, s) => sum + (s.average_stability || 0), 0) / data.length;
        const totalDuration = data.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        const bestStability = Math.max(...data.map(s => s.max_stability || 0));

        setStats({
          totalSessions: data.length,
          avgStability: Math.round(avgStability * 10) / 10,
          totalDuration: Math.round(totalDuration / 60),
          bestStability: Math.round(bestStability * 10) / 10,
        });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const generateMockTimeSeriesData = (duration: number) => {
    const points = Math.floor(duration / 5);
    const data = [];
    for (let i = 0; i < points; i++) {
      const progress = i / points;
      const baseStability = 95 - (progress * 25);
      const baseTremor = 5 + (progress * 8);
      data.push({
        timestamp: i * 5000,
        stability: baseStability + (Math.random() * 4 - 2),
        tremor: baseTremor + (Math.random() * 2 - 1),
        velocity: 1.0 - (progress * 0.4) + (Math.random() * 0.1 - 0.05),
        jitter: 2 + (progress * 3) + (Math.random() * 1),
      });
    }
    return data;
  };

  const handleSessionClick = (session: Session) => {
    const mockSessionData = {
      id: session.id,
      date: formatDate(session.created_at),
      duration: formatDuration(session.duration_seconds),
      reps: session.total_reps || Math.floor(session.duration_seconds / 5),
      hypertrophyScore: session.hypertrophy_efficiency_score || Math.round(session.average_stability * 0.85),
      stabilityScore: Math.round(session.average_stability),
      timeSeriesData: generateMockTimeSeriesData(session.duration_seconds),
      failureSnapshot: session.peak_fatigue > 70 ? {
        joint: ['WRIST', 'ELBOW', 'SHOULDER'][Math.floor(Math.random() * 3)],
        tremor: 10 + Math.random() * 3,
        timestamp: Math.floor(session.duration_seconds * 800),
        posture: 'Bottom of rep, eccentric phase complete',
      } : undefined,
      effectiveReps: session.hypertrophy_reps || Math.floor(session.duration_seconds / 6),
      timeUnderNeuralTension: session.time_under_neural_tension || Math.floor(session.duration_seconds * 0.6),
      allTimeBestStability: stats.bestStability,
    };
    setSelectedSession(mockSessionData);
    setIsDeepDiveOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-3 rounded-lg">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-mono font-bold text-white tracking-tight">
                NEURO-FORM
              </h1>
              <p className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                Neural Performance Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/trainer')}
            className="px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Start Training
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Total Sessions</span>
          </div>
          <div className="text-4xl font-mono font-bold text-white">{stats.totalSessions}</div>
        </div>

        <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Avg Stability</span>
          </div>
          <div className="text-4xl font-mono font-bold text-white">{stats.avgStability}%</div>
        </div>

        <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Best Stability</span>
          </div>
          <div className="text-4xl font-mono font-bold text-white">{stats.bestStability}%</div>
        </div>

        <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-wider">Total Time</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white">{stats.totalDuration}m</div>
        </div>
      </div>

      <div className="mb-8">
        <AIInsightCards sessions={sessions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CNSReadinessGauge sessions={sessions} />
        <ExerciseHeatmap sessions={sessions} />
      </div>

      <div className="mb-8">
        <NeuralTrendChart sessions={sessions} />
      </div>

      <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
        <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Sessions
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-cyan-400 font-mono animate-pulse">Loading sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 font-mono mb-4">No sessions yet</div>
            <button
              onClick={() => navigate('/trainer')}
              className="px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all inline-flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Start Your First Session
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session)}
                className="bg-slate-950 rounded p-4 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-cyan-400 font-mono text-sm">
                        {formatDate(session.created_at)}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        session.average_stability > 80 ? 'bg-green-500/20 text-green-400' :
                        session.average_stability > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {session.average_stability.toFixed(1)}% Avg
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-slate-400 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        {formatDuration(session.duration_seconds)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        {session.max_stability.toFixed(1)}% Peak
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        {session.peak_fatigue.toFixed(0)}% Fatigue
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SessionDeepDive
        session={selectedSession}
        isOpen={isDeepDiveOpen}
        onClose={() => setIsDeepDiveOpen(false)}
      />
    </div>
  );
};
