import { useRef, useCallback } from 'react';

interface RepData {
  timestamp: number;
  velocity: number;
  tremor: number;
  jitter: number;
  stability: number;
}

interface RepAnalysis {
  repNumber: number;
  avgVelocity: number;
  peakTremor: number;
  jitterStdDev: number;
  velocityLoss: number;
  isInHypertrophyZone: boolean;
  hypertrophyProgress: number;
}

export const useRepAnalyzer = () => {
  const repDataBuffer = useRef<RepData[]>([]);
  const firstRepAvgVelocity = useRef<number | null>(null);
  const repHistory = useRef<RepAnalysis[]>([]);
  const jitterHistory = useRef<number[]>([]);
  const currentRepStartIndex = useRef(0);
  const repCount = useRef(0);
  const lastStability = useRef<number>(0);
  const inRepPhase = useRef<boolean>(false);
  const repPhaseStartTime = useRef<number>(0);

  const VELOCITY_THRESHOLD = 0.40;
  const JITTER_WINDOW_SIZE = 30;
  const MIN_REP_SAMPLES = 5;
  const MIN_REPS_BEFORE_ALERT = 5;
  const HYPERTROPHY_TREMOR_MIN = 8;
  const HYPERTROPHY_TREMOR_MAX = 12;
  const FATIGUE_ZONE_THRESHOLD = 85;
  const REP_STABILITY_THRESHOLD = 5;
  const MIN_REP_DURATION_MS = 500;

  const calculateStdDev = (values: number[]): number => {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  };

  const detectNonLinearJitter = (): boolean => {
    if (jitterHistory.current.length < JITTER_WINDOW_SIZE * 2) return false;

    const recentJitter = jitterHistory.current.slice(-JITTER_WINDOW_SIZE);
    const earlierJitter = jitterHistory.current.slice(-JITTER_WINDOW_SIZE * 2, -JITTER_WINDOW_SIZE);

    const recentStdDev = calculateStdDev(recentJitter);
    const earlierStdDev = calculateStdDev(earlierJitter);
    const recentMean = recentJitter.reduce((sum, val) => sum + val, 0) / recentJitter.length;

    const stdDevIncrease = earlierStdDev > 0 ? (recentStdDev - earlierStdDev) / earlierStdDev : 0;
    const coefficientOfVariation = recentMean > 0 ? (recentStdDev / recentMean) : 0;

    return stdDevIncrease > 0.5 && coefficientOfVariation > 0.6;
  };

  const analyzeCurrentRep = useCallback((): RepAnalysis | null => {
    const currentRepData = repDataBuffer.current.slice(currentRepStartIndex.current);

    if (currentRepData.length < MIN_REP_SAMPLES) return null;

    const avgVelocity = currentRepData.reduce((sum, d) => sum + d.velocity, 0) / currentRepData.length;
    const peakTremor = Math.max(...currentRepData.map(d => d.tremor));
    const jitterValues = currentRepData.map(d => d.jitter);
    const jitterStdDev = calculateStdDev(jitterValues);

    if (firstRepAvgVelocity.current === null) {
      firstRepAvgVelocity.current = avgVelocity;
    }

    const velocityLoss = firstRepAvgVelocity.current > 0
      ? (firstRepAvgVelocity.current - avgVelocity) / firstRepAvgVelocity.current
      : 0;

    const isInHypertrophyZone = peakTremor >= HYPERTROPHY_TREMOR_MIN && peakTremor <= HYPERTROPHY_TREMOR_MAX;

    const progressFromVelocity = Math.min(100, Math.max(0, velocityLoss * 100 / 0.45));
    const progressFromTremor = peakTremor >= HYPERTROPHY_TREMOR_MIN ? Math.min(100, (peakTremor - 8) * 10) : 0;
    const hypertrophyProgress = Math.max(progressFromVelocity, progressFromTremor);

    const analysis: RepAnalysis = {
      repNumber: repCount.current,
      avgVelocity,
      peakTremor,
      jitterStdDev,
      velocityLoss,
      isInHypertrophyZone,
      hypertrophyProgress
    };

    return analysis;
  }, []);

  const shouldTriggerFinalRep = useCallback((): boolean => {
    if (repDataBuffer.current.length < 100) return false;
    if (repHistory.current.length < MIN_REPS_BEFORE_ALERT) return false;

    const analysis = analyzeCurrentRep();
    if (!analysis) return false;

    const recentReps = repHistory.current.slice(-3);
    if (recentReps.length < 3) return false;

    const velocityDecreasing = recentReps.every((rep, idx) => {
      if (idx === 0) return true;
      return rep.avgVelocity <= recentReps[idx - 1].avgVelocity;
    });

    const significantVelocityLoss = analysis.velocityLoss >= VELOCITY_THRESHOLD;
    const tremorElevated = analysis.peakTremor >= HYPERTROPHY_TREMOR_MIN;
    const jitterSpiking = detectNonLinearJitter();
    const inDangerZone = analysis.hypertrophyProgress >= FATIGUE_ZONE_THRESHOLD;

    const criticalConditionsMet = [
      significantVelocityLoss,
      tremorElevated,
      jitterSpiking,
      velocityDecreasing,
      inDangerZone
    ].filter(Boolean).length;

    return criticalConditionsMet >= 3;
  }, [analyzeCurrentRep]);

  const addDataPoint = useCallback((data: {
    velocity: number;
    tremor: number;
    jitter: number;
    stability: number;
  }) => {
    const dataPoint: RepData = {
      timestamp: Date.now(),
      velocity: data.velocity,
      tremor: data.tremor,
      jitter: data.jitter,
      stability: data.stability
    };

    const stabilityChange = Math.abs(data.stability - lastStability.current);
    const now = Date.now();

    if (!inRepPhase.current && stabilityChange > REP_STABILITY_THRESHOLD) {
      inRepPhase.current = true;
      repPhaseStartTime.current = now;
    } else if (inRepPhase.current && stabilityChange < REP_STABILITY_THRESHOLD / 2) {
      const repDuration = now - repPhaseStartTime.current;
      if (repDuration >= MIN_REP_DURATION_MS) {
        const analysis = analyzeCurrentRep();
        if (analysis) {
          repHistory.current.push(analysis);
          repCount.current += 1;
          currentRepStartIndex.current = repDataBuffer.current.length;
        }
        inRepPhase.current = false;
      }
    }

    lastStability.current = data.stability;
    repDataBuffer.current.push(dataPoint);
    jitterHistory.current.push(data.jitter);

    if (jitterHistory.current.length > JITTER_WINDOW_SIZE * 3) {
      jitterHistory.current.shift();
    }
  }, []);

  const markRepComplete = useCallback(() => {
    const analysis = analyzeCurrentRep();
    if (analysis) {
      repHistory.current.push(analysis);
    }

    repCount.current += 1;
    currentRepStartIndex.current = repDataBuffer.current.length;
  }, [analyzeCurrentRep]);

  const getHypertrophyEfficiencyScore = useCallback((): number => {
    if (repHistory.current.length === 0) return 0;

    const hypertrophyReps = repHistory.current.filter(rep => rep.isInHypertrophyZone).length;
    const totalReps = repHistory.current.length;

    const efficiency = (hypertrophyReps / totalReps) * 100;

    const avgVelocityLoss = repHistory.current.reduce((sum, rep) => sum + rep.velocityLoss, 0) / totalReps;
    const velocityBonus = Math.min(20, avgVelocityLoss * 50);

    return Math.min(100, efficiency + velocityBonus);
  }, []);

  const getCurrentAnalysis = useCallback((): RepAnalysis | null => {
    return analyzeCurrentRep();
  }, [analyzeCurrentRep]);

  const reset = useCallback(() => {
    repDataBuffer.current = [];
    firstRepAvgVelocity.current = null;
    repHistory.current = [];
    jitterHistory.current = [];
    currentRepStartIndex.current = 0;
    repCount.current = 0;
    lastStability.current = 0;
    inRepPhase.current = false;
    repPhaseStartTime.current = 0;
  }, []);

  const getRepStats = useCallback(() => {
    return {
      totalReps: repHistory.current.length,
      hypertrophyReps: repHistory.current.filter(rep => rep.isInHypertrophyZone).length,
      avgVelocityLoss: repHistory.current.length > 0
        ? repHistory.current.reduce((sum, rep) => sum + rep.velocityLoss, 0) / repHistory.current.length
        : 0,
      peakTremorAvg: repHistory.current.length > 0
        ? repHistory.current.reduce((sum, rep) => sum + rep.peakTremor, 0) / repHistory.current.length
        : 0
    };
  }, []);

  return {
    addDataPoint,
    markRepComplete,
    shouldTriggerFinalRep,
    getCurrentAnalysis,
    getHypertrophyEfficiencyScore,
    getRepStats,
    reset,
    repCount: repCount.current
  };
};
