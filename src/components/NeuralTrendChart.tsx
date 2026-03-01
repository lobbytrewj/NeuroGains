import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface NeuralTrendChartProps {
  sessions: any[];
}

export const NeuralTrendChart = ({ sessions }: NeuralTrendChartProps) => {
  const chartData = sessions
    .slice(0, 7)
    .reverse()
    .map((session, index) => {
      const date = new Date(session.created_at);
      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        stability: Math.round(session.average_stability || 0),
        fatigue: Math.round(session.peak_fatigue || 0),
      };
    });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-cyan-500/30 rounded p-3 font-mono text-sm">
          <p className="text-white mb-2">{payload[0].payload.name}</p>
          <p className="text-cyan-400">Stability: {payload[0].value}%</p>
          <p className="text-amber-400">Fatigue: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
          Weekly Stability Trends
        </h3>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-sm">
          No session data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(30, 41, 59)" />
            <XAxis
              dataKey="name"
              stroke="rgb(148, 163, 184)"
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
            />
            <YAxis
              yAxisId="left"
              stroke="rgb(34, 211, 238)"
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
              label={{ value: 'Stability %', angle: -90, position: 'insideLeft', style: { fill: 'rgb(34, 211, 238)', fontFamily: 'monospace', fontSize: '12px' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="rgb(251, 191, 36)"
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
              label={{ value: 'Fatigue %', angle: 90, position: 'insideRight', style: { fill: 'rgb(251, 191, 36)', fontFamily: 'monospace', fontSize: '12px' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
              iconType="line"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="stability"
              stroke="rgb(34, 211, 238)"
              strokeWidth={3}
              dot={{ fill: 'rgb(34, 211, 238)', r: 5 }}
              activeDot={{ r: 7 }}
              name="Stability"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="fatigue"
              stroke="rgb(251, 191, 36)"
              strokeWidth={3}
              dot={{ fill: 'rgb(251, 191, 36)', r: 5 }}
              activeDot={{ r: 7 }}
              name="Fatigue"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
