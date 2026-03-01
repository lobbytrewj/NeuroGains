import { Calendar } from 'lucide-react';

interface ExerciseHeatmapProps {
  sessions: any[];
}

export const ExerciseHeatmap = ({ sessions }: ExerciseHeatmapProps) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getWeekData = () => {
    const weekData = daysOfWeek.map(day => ({
      day,
      tension: 0,
      sessions: 0,
      totalSets: 0,
    }));

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);

    sessions.forEach(session => {
      const sessionDate = new Date(session.created_at);
      const daysDiff = Math.floor((sessionDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 0 && daysDiff < 7) {
        const dayIndex = daysDiff;
        if (weekData[dayIndex]) {
          const tension = (session.time_under_neural_tension || 0) / 60;
          weekData[dayIndex].tension += tension;
          weekData[dayIndex].sessions += 1;
          weekData[dayIndex].totalSets += (session.total_reps || 0);
        }
      }
    });

    return weekData;
  };

  const weekData = getWeekData();
  const maxTension = Math.max(...weekData.map(d => d.tension), 1);

  const getTensionColor = (tension: number) => {
    if (tension === 0) return 'bg-slate-800 border-slate-700';

    const intensity = tension / maxTension;

    if (intensity >= 0.8) return 'bg-amber-500 border-amber-400';
    if (intensity >= 0.6) return 'bg-amber-500/80 border-amber-400/80';
    if (intensity >= 0.4) return 'bg-amber-500/60 border-amber-400/60';
    if (intensity >= 0.2) return 'bg-amber-500/40 border-amber-400/40';
    return 'bg-amber-500/20 border-amber-400/20';
  };

  const getTensionLabel = (tension: number) => {
    if (tension === 0) return 'None';
    const intensity = tension / maxTension;
    if (intensity >= 0.8) return 'Extreme';
    if (intensity >= 0.6) return 'High';
    if (intensity >= 0.4) return 'Moderate';
    if (intensity >= 0.2) return 'Low';
    return 'Very Low';
  };

  const totalSets = weekData.reduce((sum, d) => sum + d.totalSets, 0);
  const totalTension = weekData.reduce((sum, d) => sum + d.tension, 0);
  const peakDay = weekData.reduce((max, d) => d.tension > max.tension ? d : max, weekData[0]);

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-cyan-400" />
        <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
          Weekly Neural Tension
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekData.map((data, index) => (
          <div key={index} className="group relative">
            <div className="text-center mb-2">
              <div className="text-slate-400 font-mono text-xs">{data.day}</div>
            </div>
            <div
              className={`aspect-square rounded border-2 ${getTensionColor(data.tension)} transition-all cursor-pointer hover:scale-110 hover:shadow-lg flex items-center justify-center`}
            >
              {data.sessions > 0 && (
                <span className="text-white font-mono text-xs font-bold">
                  {data.sessions}
                </span>
              )}
            </div>

            {data.tension > 0 && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-cyan-500/30 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="font-mono text-xs text-white mb-1">{data.day}</div>
                <div className="font-mono text-xs text-cyan-400">
                  {data.sessions} session{data.sessions !== 1 ? 's' : ''}
                </div>
                <div className="font-mono text-xs text-amber-400">
                  {Math.round(data.tension)}min tension
                </div>
                <div className="font-mono text-xs text-slate-400">
                  {getTensionLabel(data.tension)} intensity
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></div>
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-400/20"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/60 border border-amber-400/60"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500 border border-amber-400"></div>
          <span>Extreme</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
        <div className="text-center">
          <div className="text-slate-400 font-mono text-xs mb-1">Total Sets</div>
          <div className="text-white font-mono font-bold text-lg">{totalSets}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 font-mono text-xs mb-1">Peak Day</div>
          <div className="text-amber-400 font-mono font-bold text-lg">
            {peakDay.tension > 0 ? peakDay.day : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 font-mono text-xs mb-1">Avg/Day</div>
          <div className="text-cyan-400 font-mono font-bold text-lg">
            {Math.round(totalTension / 7)}m
          </div>
        </div>
      </div>
    </div>
  );
};
