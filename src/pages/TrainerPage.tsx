import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNeuroStream } from '../hooks/useNeuroStream';
import { useMockNeuroData } from '../hooks/useMockNeuroData';
import { useRepAnalyzer } from '../hooks/useRepAnalyzer';
import { usePoseRepDetector } from '../hooks/usePoseRepDetector';
import { useAudioAlert } from '../hooks/useAudioAlert';
import { NeuralVideoFeed } from '../components/NeuralVideoFeed';
import { NeuralStabilityChart } from '../components/NeuralStabilityChart';
import { FatigueGauge } from '../components/FatigueGauge';
import { BiometricPanel } from '../components/BiometricPanel';
import { HypertrophyZoneIndicator } from '../components/HypertrophyZoneIndicator';
import { FinalRepAlert } from '../components/FinalRepAlert';
import { HypertrophyScoreCard } from '../components/HypertrophyScoreCard';
import { Activity, Zap, PlayCircle, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const TrainerPage = () => {
  const navigate = useNavigate();
  const { data: wsData, isConnected } = useNeuroStream();
  const mockData = useMockNeuroData(!isConnected);
  const data = wsData || mockData;

  const repAnalyzer = useRepAnalyzer();
  const poseRepDetector = usePoseRepDetector();
  const { playFinalRepAlert, playSuccessSound } = useAudioAlert();

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [baseline, setBaseline] = useState(90);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionData, setSessionData] = useState<Array<any>>([]);
  const [showFinalRepAlert, setShowFinalRepAlert] = useState(false);
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [hasTriggeredFinalRep, setHasTriggeredFinalRep] = useState(false);
  const [poseRepCount, setPoseRepCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(180);
  const [repProgress, setRepProgress] = useState(0);
  const [capturedSessionMetrics, setCapturedSessionMetrics] = useState<{
    totalReps: number;
    hypertrophyReps: number;
    avgVelocityLoss: number;
    peakTremorAvg: number;
    timeUnderNeuralTension: number;
  } | null>(null);

  const calibrationSamplesRef = useRef<number[]>([]);
  const sessionIdRef = useRef<string | null>(null);
  const lastRepCountRef = useRef<number>(0);

  useEffect(() => {
    if (isCalibrating && data) {
      calibrationSamplesRef.current.push(data.stability);

      if (calibrationSamplesRef.current.length >= 30) {
        const avgStability =
          calibrationSamplesRef.current.reduce((a, b) => a + b, 0) /
          calibrationSamplesRef.current.length;
        setBaseline(avgStability);
        setIsCalibrating(false);
        calibrationSamplesRef.current = [];
      }
    }
  }, [data, isCalibrating]);

  useEffect(() => {
    if (isSessionActive && !sessionStartTime) {
      setSessionStartTime(Date.now());
      initializeSession();
    }
  }, [isSessionActive]);

  useEffect(() => {
    if (isSessionActive && data && sessionIdRef.current) {
      setSessionData((prev) => [...prev, data]);

      const velocity = Math.abs(data.stability - baseline) * 2;
      repAnalyzer.addDataPoint({
        velocity,
        tremor: data.tremor,
        jitter: data.jitterFrequency,
        stability: data.stability
      });
    }
  }, [isSessionActive, data, baseline, repAnalyzer]);

  const initializeSession = async () => {
    try {
      console.log('Initializing new session...');
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          start_time: new Date().toISOString(),
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Failed to initialize session:', error);
        return;
      }
      if (session) {
        sessionIdRef.current = session.id;
        console.log('Session initialized successfully:', session.id);
      } else {
        console.warn('No session returned from insert');
      }
    } catch (error) {
      console.error('Exception during session initialization:', error);
    }
  };

  const endSession = async () => {
    if (!sessionStartTime || !sessionIdRef.current) {
      console.log('Cannot end session - missing sessionStartTime or sessionId', {
        sessionStartTime,
        sessionId: sessionIdRef.current
      });
      setIsSessionActive(false);
      setSessionStartTime(null);
      setSessionData([]);
      repAnalyzer.reset();
      setHasTriggeredFinalRep(false);
      return;
    }

    try {
      const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      const avgStability = sessionData.length > 0
        ? sessionData.reduce((sum, d) => sum + d.stability, 0) / sessionData.length
        : data?.stability || 0;
      const peakFatigue = sessionData.length > 0
        ? Math.max(...sessionData.map((d) => d.fatigue))
        : data?.fatigue || 0;
      const minStability = sessionData.length > 0
        ? Math.min(...sessionData.map((d) => d.stability))
        : data?.stability || 100;
      const maxStability = sessionData.length > 0
        ? Math.max(...sessionData.map((d) => d.stability))
        : data?.stability || 0;

      const repStats = repAnalyzer.getRepStats();
      const hypertrophyScore = repAnalyzer.getHypertrophyEfficiencyScore();
      const currentAnalysis = repAnalyzer.getCurrentAnalysis();

      const baselineVelocity = sessionData.length > 0 && repStats.totalReps >= 2
        ? sessionData.slice(0, Math.floor(sessionData.length / Math.max(1, repStats.totalReps)) * 2)
            .reduce((sum, d) => sum + Math.abs(d.stability - baseline) * 2, 0) /
            Math.min(sessionData.length, Math.floor(sessionData.length / Math.max(1, repStats.totalReps)) * 2)
        : null;

      const baselineTremor = sessionData.length > 0
        ? sessionData.slice(0, Math.floor(sessionData.length / Math.max(1, repStats.totalReps || 1)))[0]?.tremor || null
        : null;

      const timeUnderNeuralTension = sessionData.filter(
        d => d.tremor >= 8 && d.tremor <= 12
      ).length * 0.1;

      console.log('Ending session with stats:', {
        id: sessionIdRef.current,
        durationSeconds,
        avgStability,
        peakFatigue,
        minStability,
        maxStability,
        dataPoints: sessionData.length,
        repStats,
        hypertrophyScore,
        baselineVelocity,
        baselineTremor,
        timeUnderNeuralTension,
        baselineCalibrated: repAnalyzer.isBaselineCalibrated()
      });

      setCapturedSessionMetrics({
        totalReps: repStats.totalReps,
        hypertrophyReps: repStats.hypertrophyReps,
        avgVelocityLoss: repStats.avgVelocityLoss,
        peakTremorAvg: repStats.peakTremorAvg,
        timeUnderNeuralTension: Math.round(timeUnderNeuralTension)
      });

      const { error } = await supabase
        .from('sessions')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: durationSeconds,
          average_stability: avgStability,
          peak_fatigue: peakFatigue,
          min_stability: minStability,
          max_stability: maxStability,
          total_reps: repStats.totalReps,
          hypertrophy_reps: repStats.hypertrophyReps,
          hypertrophy_efficiency_score: hypertrophyScore,
          avg_velocity_loss: repStats.avgVelocityLoss,
          peak_tremor_avg: repStats.peakTremorAvg,
          baseline_velocity: baselineVelocity,
          baseline_tremor: baselineTremor,
          baseline_calibrated: repAnalyzer.isBaselineCalibrated(),
          tremor_deviation_avg: currentAnalysis?.tremorDeviation || 0,
        })
        .eq('id', sessionIdRef.current);

      if (error) {
        console.error('Database error ending session:', error);
        throw error;
      }

      console.log('Session ended successfully');
      playSuccessSound();

      setFinalScore(hypertrophyScore);
      setShowScoreCard(true);

      setIsSessionActive(false);
      setSessionStartTime(null);
      setSessionData([]);
      sessionIdRef.current = null;
      repAnalyzer.reset();
      poseRepDetector.reset();
      setHasTriggeredFinalRep(false);
      setPoseRepCount(0);
      lastRepCountRef.current = 0;
    } catch (error) {
      console.error('Failed to end session:', error);
      setIsSessionActive(false);
      setSessionStartTime(null);
      setSessionData([]);
      sessionIdRef.current = null;
      repAnalyzer.reset();
      poseRepDetector.reset();
      setHasTriggeredFinalRep(false);
      setPoseRepCount(0);
      lastRepCountRef.current = 0;
    }
  };

  const handlePoseLandmarks = (landmarks: any[]) => {
    const repCompleted = poseRepDetector.updateWithLandmarks(landmarks);

    const angle = poseRepDetector.getCurrentAngle();
    setCurrentAngle(angle);

    const progress = poseRepDetector.getRepProgress();
    setRepProgress(progress);

    if (!isSessionActive) return;

    const currentRepCount = poseRepDetector.getRepCount();

    if (repCompleted && currentRepCount > lastRepCountRef.current) {
      setPoseRepCount(currentRepCount);
      lastRepCountRef.current = currentRepCount;

      const repHistory = poseRepDetector.getRepHistory();
      const latestRep = repHistory[repHistory.length - 1];

      if (latestRep && data) {
        const velocity = Math.abs(data.stability - baseline) * 2;
        repAnalyzer.addDataPoint({
          velocity,
          tremor: data.tremor,
          jitter: data.jitterFrequency,
          stability: data.stability
        });
        repAnalyzer.markRepComplete();

        if (latestRep.isNeuralFatigueRep) {
          console.log('Neural fatigue detected on rep', currentRepCount);
        }

        if (poseRepDetector.shouldTriggerFinalRep() && !hasTriggeredFinalRep) {
          setShowFinalRepAlert(true);
          playFinalRepAlert();
          setHasTriggeredFinalRep(true);
        }
      }
    }
  };

  const startCalibration = () => {
    calibrationSamplesRef.current = [];
    setIsCalibrating(true);
    setTimeout(() => {
      if (isCalibrating) {
        setIsCalibrating(false);
      }
    }, 3000);
  };

  const toggleSession = async () => {
    if (isSessionActive) {
      await endSession();
    } else {
      setIsSessionActive(true);
      poseRepDetector.reset();
      setPoseRepCount(0);
      lastRepCountRef.current = 0;
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-mono animate-pulse">
          INITIALIZING NEURAL INTERFACE...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-3 rounded-lg">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-mono font-bold text-white tracking-tight">
                NEURO-FORM
              </h1>
              <p className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                Mind-Muscle Connection Trainer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={startCalibration}
              disabled={isCalibrating || isSessionActive}
              className={`px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-all ${
                isCalibrating || isSessionActive
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400'
              }`}
            >
              {isCalibrating ? 'Calibrating...' : 'Calibrate Baseline'}
            </button>

            <div className="relative">
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                style={{ pointerEvents: 'none' }}
              >
                <circle
                  cx="50%"
                  cy="50%"
                  r="calc(50% - 2px)"
                  fill="none"
                  stroke="rgba(6, 182, 212, 0.2)"
                  strokeWidth="3"
                />
                {isSessionActive && repProgress > 0 && (
                  <circle
                    cx="50%"
                    cy="50%"
                    r="calc(50% - 2px)"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${repProgress * 6.28} 628`}
                    style={{ transition: 'stroke-dasharray 0.1s ease-out' }}
                  />
                )}
              </svg>
              <button
                onClick={toggleSession}
                disabled={isCalibrating}
                className={`px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isCalibrating
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : isSessionActive
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                {isSessionActive ? 'End Session' : 'Start Session'}
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-all flex items-center gap-2 bg-slate-700 text-slate-300 hover:bg-slate-600"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-6 text-sm font-mono">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className="text-slate-400">
              {isConnected ? 'Connected to Backend' : 'Mock Data Mode'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Neural Tracking Active</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="aspect-video">
            <NeuralVideoFeed
              stability={data.stability}
              fatigue={data.fatigue}
              isCalibrating={isCalibrating}
              currentAngle={currentAngle}
              repState={poseRepDetector.getRepState()}
              onPoseLandmarks={handlePoseLandmarks}
            />
          </div>

          <NeuralStabilityChart stability={data.stability} baseline={baseline} />
        </div>

        <div className="space-y-6">
          <BiometricPanel
            stability={data.stability}
            tremor={data.tremor}
            jitterFrequency={data.jitterFrequency}
            isConnected={isConnected}
          />

          <HypertrophyZoneIndicator
            progress={repAnalyzer.getCurrentAnalysis()?.hypertrophyProgress || 0}
            isActive={isSessionActive}
            velocityLoss={repAnalyzer.getCurrentAnalysis()?.velocityLoss || 0}
            isCalibrated={repAnalyzer.isBaselineCalibrated()}
          />

          <FatigueGauge fatigue={data.fatigue} jitterFrequency={data.jitterFrequency} />

          <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
            <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider mb-4">
              Session Info
            </h3>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={isSessionActive ? 'text-green-400' : 'text-slate-500'}>
                  {isSessionActive ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              {isSessionActive && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Baseline:</span>
                  <span className={repAnalyzer.isBaselineCalibrated() ? 'text-green-400' : 'text-yellow-400'}>
                    {repAnalyzer.isBaselineCalibrated() ? '✓ CALIBRATED' : 'CALIBRATING...'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline Stability:</span>
                <span className="text-white">{baseline.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stability:</span>
                <span className="text-white">{data.stability.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deviation:</span>
                <span className={
                  data.stability >= baseline ? 'text-cyan-400' : 'text-red-400'
                }>
                  {(data.stability - baseline).toFixed(1)}%
                </span>
              </div>
              {isSessionActive && (
                <>
                  <div className="border-t border-slate-700 pt-3 mt-3"></div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reps Completed:</span>
                    <span className="text-cyan-400 text-xl font-bold">
                      {poseRepCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rep State:</span>
                    <span className={
                      poseRepDetector.getRepState() === 0 ? 'text-cyan-400' :
                      poseRepDetector.getRepState() === 1 ? 'text-orange-400' :
                      poseRepDetector.getRepState() === 2 ? 'text-red-400' : 'text-green-400'
                    }>
                      {poseRepDetector.getRepState() === 0 ? 'READY' :
                       poseRepDetector.getRepState() === 1 ? 'DESCENDING' :
                       poseRepDetector.getRepState() === 2 ? 'BOTTOM' : 'ASCENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elbow Angle:</span>
                    <span className="text-white font-bold">
                      {Math.round(currentAngle)}°
                    </span>
                  </div>
                  {repAnalyzer.getCurrentAnalysis() && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Velocity Loss:</span>
                        <span className="text-yellow-400">
                          {Math.round((repAnalyzer.getCurrentAnalysis()?.velocityLoss || 0) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">In Hypertrophy Zone:</span>
                        <span className={repAnalyzer.getCurrentAnalysis()?.isInHypertrophyZone ? 'text-green-400' : 'text-slate-500'}>
                          {repAnalyzer.getCurrentAnalysis()?.isInHypertrophyZone ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FinalRepAlert
        isVisible={showFinalRepAlert}
        onDismiss={() => setShowFinalRepAlert(false)}
      />

      {showScoreCard && capturedSessionMetrics && (
        <HypertrophyScoreCard
          score={finalScore}
          totalReps={capturedSessionMetrics.totalReps}
          hypertrophyReps={capturedSessionMetrics.hypertrophyReps}
          avgVelocityLoss={capturedSessionMetrics.avgVelocityLoss}
          peakTremorAvg={capturedSessionMetrics.peakTremorAvg}
          timeUnderNeuralTension={capturedSessionMetrics.timeUnderNeuralTension}
          isVisible={showScoreCard}
          onClose={() => {
            setShowScoreCard(false);
            setCapturedSessionMetrics(null);
            navigate('/');
          }}
        />
      )}

      <footer className="mt-8 text-center text-slate-600 font-mono text-xs">
        <p>NEURO-FORM v2.0 | AI-Powered Hypertrophy Optimization System</p>
      </footer>
    </div>
  );
};
