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
  tremorDeviation: number;
  isInHypertrophyZone: boolean;
  hypertrophyProgress: number;
}

export const useRepAnalyzer = () => {
  const repDataBuffer = useRef<RepData[]>([]);
  const baseVelocity = useRef<number | null>(null);
  const baseTremor = useRef<number | null>(null);
  const repHistory = useRef<RepAnalysis[]>([]);
  const jitterHistory = useRef<number[]>([]);
  const currentRepStartIndex = useRef(0);
  const repCount = useRef(0);
  const lastStability = useRef<number>(0);
  const inRepPhase = useRef<boolean>(false);
  const repPhaseStartTime = useRef<number>(0);
  const baselineCalibrated = useRef<boolean>(false);
  const calibrationReps = useRef<RepAnalysis[]>([]);

  const VELOCITY_LOSS_THRESHOLD = 0.30;
  const TREMOR_DEVIATION_THRESHOLD = 1.5;
  const JITTER_WINDOW_SIZE = 30;
  const MIN_REP_SAMPLES = 5;
  const CALIBRATION_REPS_COUNT = 2;
  const VELOCITY_LOSS_ORANGE = 0.20;
  const VELOCITY_LOSS_GOLD = 0.35;
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
    const avgTremor = currentRepData.reduce((sum, d) => sum + d.tremor, 0) / currentRepData.length;
    const peakTremor = Math.max(...currentRepData.map(d => d.tremor));
    const jitterValues = currentRepData.map(d => d.jitter);
    const jitterStdDev = calculateStdDev(jitterValues);

    if (!baselineCalibrated.current && calibrationReps.current.length < CALIBRATION_REPS_COUNT) {
      const tempAnalysis: RepAnalysis = {
        repNumber: repCount.current,
        avgVelocity,
        peakTremor,
        jitterStdDev,
        velocityLoss: 0,
        tremorDeviation: 0,
        isInHypertrophyZone: false,
        hypertrophyProgress: 0
      };
      calibrationReps.current.push(tempAnalysis);

      if (calibrationReps.current.length === CALIBRATION_REPS_COUNT) {
        baseVelocity.current = calibrationReps.current.reduce((sum, r) => sum + r.avgVelocity, 0) / CALIBRATION_REPS_COUNT;
        baseTremor.current = calibrationReps.current[0].peakTremor;
        baselineCalibrated.current = true;
      }

      return tempAnalysis;
    }

    const velocityLoss = baseVelocity.current && baseVelocity.current > 0
      ? Math.max(0, (baseVelocity.current - avgVelocity) / baseVelocity.current)
      : 0;

    const tremorDeviation = baseTremor.current && baseTremor.current > 0
      ? avgTremor / baseTremor.current
      : 1;

    const isInHypertrophyZone = velocityLoss >= VELOCITY_LOSS_THRESHOLD && tremorDeviation >= TREMOR_DEVIATION_THRESHOLD;

    const velocityLossPercentage = velocityLoss * 100;
    const tremorIncreaseFactor = Math.max(0, (tremorDeviation - 1) * 100);
    const hypertrophyProgress = Math.min(100, Math.max(0, (velocityLossPercentage + tremorIncreaseFactor) / 2));

    const analysis: RepAnalysis = {
      repNumber: repCount.current,
      avgVelocity,
      peakTremor,
      jitterStdDev,
      velocityLoss,
      tremorDeviation,
      isInHypertrophyZone,
      hypertrophyProgress
    };

    return analysis;
  }, []);

  const shouldTriggerFinalRep = useCallback((): boolean => {
    if (!baselineCalibrated.current) return false;
    if (repHistory.current.length < CALIBRATION_REPS_COUNT) return false;

    const analysis = analyzeCurrentRep();
    if (!analysis) return false;

    const velocityLossExceeded = analysis.velocityLoss >= VELOCITY_LOSS_GOLD;
    const tremorDeviationExceeded = analysis.tremorDeviation >= TREMOR_DEVIATION_THRESHOLD;

    return velocityLossExceeded && tremorDeviationExceeded;
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
    if (!baselineCalibrated.current) return 0;

    const validReps = repHistory.current.slice(CALIBRATION_REPS_COUNT);
    if (validReps.length === 0) return 0;

    const avgVelocityLoss = validReps.reduce((sum, rep) => sum + rep.velocityLoss, 0) / validReps.length;
    const avgTremorDeviation = validReps.reduce((sum, rep) => sum + rep.tremorDeviation, 0) / validReps.length;

    const velocityLossPercentage = Math.min(100, avgVelocityLoss * 100);
    const tremorIncreaseFactor = Math.min(100, Math.max(0, (avgTremorDeviation - 1) * 100));

    const score = (velocityLossPercentage + tremorIncreaseFactor) / 2;

    return Math.max(0, Math.min(100, score));
  }, []);

  const getCurrentAnalysis = useCallback((): RepAnalysis | null => {
    return analyzeCurrentRep();
  }, [analyzeCurrentRep]);

  const reset = useCallback(() => {
    repDataBuffer.current = [];
    baseVelocity.current = null;
    baseTremor.current = null;
    repHistory.current = [];
    jitterHistory.current = [];
    currentRepStartIndex.current = 0;
    repCount.current = 0;
    lastStability.current = 0;
    inRepPhase.current = false;
    repPhaseStartTime.current = 0;
    baselineCalibrated.current = false;
    calibrationReps.current = [];
  }, []);

  const isBaselineCalibrated = useCallback((): boolean => {
    return baselineCalibrated.current;
  }, []);

  const getColorZone = useCallback((): 'normal' | 'warning' | 'critical' => {
    const analysis = analyzeCurrentRep();
    if (!analysis || !baselineCalibrated.current) return 'normal';

    if (analysis.velocityLoss >= VELOCITY_LOSS_GOLD) return 'critical';
    if (analysis.velocityLoss >= VELOCITY_LOSS_ORANGE) return 'warning';
    return 'normal';
  }, [analyzeCurrentRep]);

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
    isBaselineCalibrated,
    getColorZone,
    repCount: repCount.current
  };
};
