import { useRef, useCallback } from 'react';

export enum RepState {
  TOP = 0,
  BOTTOM = 1,
  COMPLETE = 2
}

interface RepDetectionData {
  shoulderY: number;
  wristY: number;
  shoulderWristDistance: number;
  verticalDisplacement: number;
  normalizedHeight: number;
  velocity: number;
}

interface RepInfo {
  repNumber: number;
  peakVelocity: number;
  isNeuralFatigueRep: boolean;
  velocityLossPercent: number;
}

export const usePoseRepDetector = () => {
  const repState = useRef<RepState>(RepState.TOP);
  const repCount = useRef<number>(0);
  const topPosition = useRef<number | null>(null);
  const bottomPosition = useRef<number | null>(null);
  const lastPosition = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(Date.now());
  const currentVelocity = useRef<number>(0);
  const peakAscentVelocity = useRef<number>(0);
  const baselineVelocity = useRef<number | null>(null);
  const repHistory = useRef<RepInfo[]>([]);
  const transitionThreshold = useRef<number>(0);

  const DESCENT_THRESHOLD = 0.40;
  const ASCENT_THRESHOLD = 0.90;
  const HYSTERESIS = 0.05;
  const NEURAL_FATIGUE_THRESHOLD = 0.30;

  const calculateVerticalMetrics = useCallback((landmarks: any[]): RepDetectionData | null => {
    if (!landmarks || landmarks.length < 33) return null;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return null;

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgWristY = (leftWrist.y + rightWrist.y) / 2;

    const shoulderWristDistance = Math.abs(avgShoulderY - avgWristY);

    if (shoulderWristDistance < 0.01) return null;

    const verticalDisplacement = avgShoulderY;

    const normalizedHeight = verticalDisplacement / shoulderWristDistance;

    const now = Date.now();
    const deltaTime = (now - lastTimestamp.current) / 1000;

    let velocity = 0;
    if (lastPosition.current !== null && deltaTime > 0) {
      const deltaPosition = verticalDisplacement - lastPosition.current;
      velocity = Math.abs(deltaPosition / deltaTime);
    }

    lastPosition.current = verticalDisplacement;
    lastTimestamp.current = now;
    currentVelocity.current = velocity;

    return {
      shoulderY: avgShoulderY,
      wristY: avgWristY,
      shoulderWristDistance,
      verticalDisplacement,
      normalizedHeight,
      velocity
    };
  }, []);

  const processRepDetection = useCallback((metrics: RepDetectionData): boolean => {
    let repCompleted = false;

    switch (repState.current) {
      case RepState.TOP:
        if (topPosition.current === null) {
          topPosition.current = metrics.normalizedHeight;
          transitionThreshold.current = topPosition.current * (1 + DESCENT_THRESHOLD);
        }

        if (metrics.normalizedHeight > topPosition.current * (1 + DESCENT_THRESHOLD - HYSTERESIS)) {
          repState.current = RepState.BOTTOM;
          bottomPosition.current = metrics.normalizedHeight;
          peakAscentVelocity.current = 0;
        }
        break;

      case RepState.BOTTOM:
        if (bottomPosition.current === null || metrics.normalizedHeight > bottomPosition.current) {
          bottomPosition.current = metrics.normalizedHeight;
        }

        if (topPosition.current !== null &&
            metrics.normalizedHeight < topPosition.current * (1 + DESCENT_THRESHOLD * (1 - ASCENT_THRESHOLD) + HYSTERESIS)) {
          repState.current = RepState.COMPLETE;

          if (metrics.velocity > peakAscentVelocity.current) {
            peakAscentVelocity.current = metrics.velocity;
          }
        } else if (metrics.velocity > peakAscentVelocity.current) {
          peakAscentVelocity.current = metrics.velocity;
        }
        break;

      case RepState.COMPLETE:
        if (metrics.velocity > peakAscentVelocity.current) {
          peakAscentVelocity.current = metrics.velocity;
        }

        if (topPosition.current !== null &&
            metrics.normalizedHeight <= topPosition.current * (1 + HYSTERESIS)) {
          repCount.current += 1;

          let isNeuralFatigueRep = false;
          let velocityLossPercent = 0;

          if (baselineVelocity.current === null) {
            baselineVelocity.current = peakAscentVelocity.current;
          } else if (baselineVelocity.current > 0) {
            velocityLossPercent = (baselineVelocity.current - peakAscentVelocity.current) / baselineVelocity.current;
            isNeuralFatigueRep = velocityLossPercent >= NEURAL_FATIGUE_THRESHOLD;
          }

          repHistory.current.push({
            repNumber: repCount.current,
            peakVelocity: peakAscentVelocity.current,
            isNeuralFatigueRep,
            velocityLossPercent
          });

          repState.current = RepState.TOP;
          topPosition.current = metrics.normalizedHeight;
          bottomPosition.current = null;
          peakAscentVelocity.current = 0;
          repCompleted = true;
        }
        break;
    }

    return repCompleted;
  }, []);

  const updateWithLandmarks = useCallback((landmarks: any[]): boolean => {
    const metrics = calculateVerticalMetrics(landmarks);
    if (!metrics) return false;

    return processRepDetection(metrics);
  }, [calculateVerticalMetrics, processRepDetection]);

  const getCurrentMetrics = useCallback((landmarks: any[]): RepDetectionData | null => {
    return calculateVerticalMetrics(landmarks);
  }, [calculateVerticalMetrics]);

  const getRepState = useCallback((): RepState => {
    return repState.current;
  }, []);

  const getRepCount = useCallback((): number => {
    return repCount.current;
  }, []);

  const getRepHistory = useCallback((): RepInfo[] => {
    return [...repHistory.current];
  }, []);

  const getHeightPercentage = useCallback((landmarks: any[]): number => {
    const metrics = calculateVerticalMetrics(landmarks);
    if (!metrics || topPosition.current === null) return 0;

    const range = (topPosition.current * (1 + DESCENT_THRESHOLD)) - topPosition.current;
    if (range === 0) return 0;

    const currentOffset = metrics.normalizedHeight - topPosition.current;
    const percentage = Math.max(0, Math.min(100, (currentOffset / range) * 100));

    return percentage;
  }, [calculateVerticalMetrics]);

  const getRepTriggerLine = useCallback((): number => {
    return DESCENT_THRESHOLD * 100;
  }, []);

  const reset = useCallback(() => {
    repState.current = RepState.TOP;
    repCount.current = 0;
    topPosition.current = null;
    bottomPosition.current = null;
    lastPosition.current = null;
    lastTimestamp.current = Date.now();
    currentVelocity.current = 0;
    peakAscentVelocity.current = 0;
    baselineVelocity.current = null;
    repHistory.current = [];
    transitionThreshold.current = 0;
  }, []);

  return {
    updateWithLandmarks,
    getCurrentMetrics,
    getRepState,
    getRepCount,
    getRepHistory,
    getHeightPercentage,
    getRepTriggerLine,
    reset
  };
};
