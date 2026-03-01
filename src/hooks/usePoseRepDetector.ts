import { useRef, useCallback } from 'react';

export enum RepState {
  READY = 0,
  DESCENDING = 1,
  BOTTOM = 2,
  ASCENDING = 3
}

interface JointAngles {
  leftElbow: number;
  rightElbow: number;
  avgElbow: number;
}

interface RepInfo {
  repNumber: number;
  ascentSpeed: number;
  isNeuralFatigueRep: boolean;
  velocityLossPercent: number;
  bottomAngle: number;
  topAngle: number;
}

export const usePoseRepDetector = () => {
  const repState = useRef<RepState>(RepState.READY);
  const repCount = useRef<number>(0);
  const lastAngle = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(Date.now());
  const bottomAngle = useRef<number | null>(null);
  const topAngle = useRef<number | null>(null);
  const ascentStartTime = useRef<number | null>(null);
  const ascentStartAngle = useRef<number | null>(null);
  const currentAscentSpeed = useRef<number>(0);
  const baselineAscentSpeed = useRef<number | null>(null);
  const repHistory = useRef<RepInfo[]>([]);

  const READY_ANGLE_THRESHOLD = 160;
  const BOTTOM_ANGLE_THRESHOLD = 90;
  const HYSTERESIS = 5;
  const NEURAL_FATIGUE_THRESHOLD = 0.30;
  const BASELINE_REPS_COUNT = 2;

  const calculateAngle = useCallback((
    point1: { x: number; y: number },
    point2: { x: number; y: number },
    point3: { x: number; y: number }
  ): number => {
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    };

    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y
    };

    const length1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const length2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    if (length1 === 0 || length2 === 0) return 180;

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const cosineAngle = dotProduct / (length1 * length2);
    const clampedCosine = Math.max(-1, Math.min(1, cosineAngle));
    const angleRad = Math.acos(clampedCosine);
    const angleDeg = (angleRad * 180) / Math.PI;

    return angleDeg;
  }, []);

  const calculateJointAngles = useCallback((landmarks: any[]): JointAngles | null => {
    if (!landmarks || landmarks.length < 33) return null;

    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !leftElbow || !leftWrist ||
        !rightShoulder || !rightElbow || !rightWrist) {
      return null;
    }

    const leftElbowAngle = calculateAngle(
      { x: leftShoulder.x, y: leftShoulder.y },
      { x: leftElbow.x, y: leftElbow.y },
      { x: leftWrist.x, y: leftWrist.y }
    );

    const rightElbowAngle = calculateAngle(
      { x: rightShoulder.x, y: rightShoulder.y },
      { x: rightElbow.x, y: rightElbow.y },
      { x: rightWrist.x, y: rightWrist.y }
    );

    const avgElbow = (leftElbowAngle + rightElbowAngle) / 2;

    return {
      leftElbow: leftElbowAngle,
      rightElbow: rightElbowAngle,
      avgElbow
    };
  }, [calculateAngle]);

  const processRepDetection = useCallback((angles: JointAngles): boolean => {
    let repCompleted = false;
    const currentAngle = angles.avgElbow;
    const now = Date.now();

    switch (repState.current) {
      case RepState.READY:
        if (currentAngle < READY_ANGLE_THRESHOLD - HYSTERESIS) {
          repState.current = RepState.DESCENDING;
          topAngle.current = lastAngle.current || currentAngle;
          ascentStartTime.current = null;
          ascentStartAngle.current = null;
          currentAscentSpeed.current = 0;
        }
        break;

      case RepState.DESCENDING:
        if (currentAngle < BOTTOM_ANGLE_THRESHOLD) {
          repState.current = RepState.BOTTOM;
          bottomAngle.current = currentAngle;
        } else if (currentAngle > READY_ANGLE_THRESHOLD) {
          repState.current = RepState.READY;
        }
        break;

      case RepState.BOTTOM:
        if (lastAngle.current !== null && currentAngle > lastAngle.current) {
          repState.current = RepState.ASCENDING;
          ascentStartTime.current = now;
          ascentStartAngle.current = currentAngle;
        }
        break;

      case RepState.ASCENDING:
        if (ascentStartTime.current && ascentStartAngle.current !== null) {
          const timeElapsed = (now - ascentStartTime.current) / 1000;
          const angleChange = currentAngle - ascentStartAngle.current;

          if (timeElapsed > 0 && angleChange > 0) {
            currentAscentSpeed.current = angleChange / timeElapsed;
          }
        }

        if (currentAngle > READY_ANGLE_THRESHOLD + HYSTERESIS) {
          repCount.current += 1;

          let isNeuralFatigueRep = false;
          let velocityLossPercent = 0;

          if (repCount.current <= BASELINE_REPS_COUNT) {
            if (baselineAscentSpeed.current === null) {
              baselineAscentSpeed.current = currentAscentSpeed.current;
            } else {
              baselineAscentSpeed.current =
                (baselineAscentSpeed.current + currentAscentSpeed.current) / 2;
            }
          } else if (baselineAscentSpeed.current && baselineAscentSpeed.current > 0) {
            velocityLossPercent =
              (baselineAscentSpeed.current - currentAscentSpeed.current) / baselineAscentSpeed.current;
            isNeuralFatigueRep = velocityLossPercent >= NEURAL_FATIGUE_THRESHOLD;
          }

          repHistory.current.push({
            repNumber: repCount.current,
            ascentSpeed: currentAscentSpeed.current,
            isNeuralFatigueRep,
            velocityLossPercent,
            bottomAngle: bottomAngle.current || 0,
            topAngle: topAngle.current || 180
          });

          repState.current = RepState.READY;
          bottomAngle.current = null;
          ascentStartTime.current = null;
          ascentStartAngle.current = null;
          currentAscentSpeed.current = 0;
          repCompleted = true;
        } else if (currentAngle < lastAngle.current - HYSTERESIS) {
          repState.current = RepState.DESCENDING;
          ascentStartTime.current = null;
          ascentStartAngle.current = null;
          currentAscentSpeed.current = 0;
        }
        break;
    }

    lastAngle.current = currentAngle;
    lastTimestamp.current = now;

    return repCompleted;
  }, []);

  const updateWithLandmarks = useCallback((landmarks: any[]): boolean => {
    const angles = calculateJointAngles(landmarks);
    if (!angles) return false;

    return processRepDetection(angles);
  }, [calculateJointAngles, processRepDetection]);

  const getCurrentAngles = useCallback((landmarks: any[]): JointAngles | null => {
    return calculateJointAngles(landmarks);
  }, [calculateJointAngles]);

  const getRepState = useCallback((): RepState => {
    return repState.current;
  }, []);

  const getRepCount = useCallback((): number => {
    return repCount.current;
  }, []);

  const getRepHistory = useCallback((): RepInfo[] => {
    return [...repHistory.current];
  }, []);

  const getCurrentAngle = useCallback((): number => {
    return lastAngle.current || 180;
  }, []);

  const getRepProgress = useCallback((): number => {
    if (lastAngle.current === null) return 0;

    const currentAngle = lastAngle.current;

    if (repState.current === RepState.READY) {
      return 0;
    }

    const topRange = READY_ANGLE_THRESHOLD;
    const bottomRange = BOTTOM_ANGLE_THRESHOLD;
    const totalRange = topRange - bottomRange;

    if (repState.current === RepState.DESCENDING || repState.current === RepState.BOTTOM) {
      const progress = Math.max(0, Math.min(100,
        ((topRange - currentAngle) / totalRange) * 50
      ));
      return progress;
    }

    if (repState.current === RepState.ASCENDING) {
      const progress = 50 + Math.max(0, Math.min(50,
        ((currentAngle - bottomRange) / totalRange) * 50
      ));
      return progress;
    }

    return 0;
  }, []);

  const shouldTriggerFinalRep = useCallback((): boolean => {
    if (repCount.current < 5) return false;

    const recentReps = repHistory.current.slice(-3);
    const fatigueReps = recentReps.filter(rep => rep.isNeuralFatigueRep);

    return fatigueReps.length >= 3;
  }, []);

  const reset = useCallback(() => {
    repState.current = RepState.READY;
    repCount.current = 0;
    lastAngle.current = null;
    lastTimestamp.current = Date.now();
    bottomAngle.current = null;
    topAngle.current = null;
    ascentStartTime.current = null;
    ascentStartAngle.current = null;
    currentAscentSpeed.current = 0;
    baselineAscentSpeed.current = null;
    repHistory.current = [];
  }, []);

  return {
    updateWithLandmarks,
    getCurrentAngles,
    getRepState,
    getRepCount,
    getRepHistory,
    getCurrentAngle,
    getRepProgress,
    shouldTriggerFinalRep,
    reset
  };
};
