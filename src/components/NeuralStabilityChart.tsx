import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DataPoint {
  time: number;
  stability: number;
}

interface NeuralStabilityChartProps {
  stability: number;
  baseline: number;
}

export const NeuralStabilityChart = ({ stability, baseline }: NeuralStabilityChartProps) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000;

    setData((prevData) => {
      const newData = [
        ...prevData,
        {
          time: currentTime,
          stability,
        },
      ];

      return newData.slice(-60);
    });
  }, [stability]);

  return (
    <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
            Motor Cortex Firing Consistency
          </h3>
          <div className="text-white font-mono text-2xl mt-1">
            {stability.toFixed(1)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
            Baseline
          </div>
          <div className="text-white font-mono text-xl mt-1">
            {baseline.toFixed(1)}%
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontFamily: 'monospace', fontSize: 10 }}
            tickFormatter={(value) => `${value.toFixed(0)}s`}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#64748b"
            tick={{ fill: '#64748b', fontFamily: 'monospace', fontSize: 10 }}
            tickFormatter={(value) => `${value}%`}
          />
          <ReferenceLine
            y={baseline}
            stroke="#FCD34D"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="stability"
            stroke="#06B6D4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-cyan-400"></div>
          <span className="text-slate-400">Neural Stability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-yellow-400"></div>
          <span className="text-slate-400">Calibrated Baseline</span>
        </div>
      </div>
    </div>
  );
};
