import { useEffect, useState, useRef } from 'react';
import { NeuroData } from './useNeuroStream';

export const useMockNeuroData = (enabled: boolean) => {
  const [data, setData] = useState<NeuroData | null>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let startTime = Date.now();
    let tremorSpikeTime = startTime + Math.random() * 5000 + 3000;

    const generateData = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current < 50) {
        animationFrameRef.current = requestAnimationFrame(generateData);
        return;
      }

      lastUpdateRef.current = timestamp;
      const elapsed = Date.now() - startTime;

      const isTremorSpike = Date.now() > tremorSpikeTime;

      if (isTremorSpike && Date.now() - tremorSpikeTime > 1500) {
        tremorSpikeTime = Date.now() + Math.random() * 5000 + 3000;
      }

      const baseStability = isTremorSpike ? 65 + Math.random() * 15 : 80 + Math.random() * 15;
      const tremor = isTremorSpike ? 0.3 + Math.random() * 0.4 : 0.05 + Math.random() * 0.1;
      const jitterFrequency = isTremorSpike ? 8 + Math.random() * 12 : 1 + Math.random() * 3;

      const fatigue = Math.min(100, (elapsed / 60000) * 100 + Math.random() * 10);

      setData({
        timestamp: Date.now(),
        stability: baseStability,
        tremor,
        fatigue,
        jitterFrequency,
      });

      animationFrameRef.current = requestAnimationFrame(generateData);
    };

    animationFrameRef.current = requestAnimationFrame(generateData);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  return data;
};
