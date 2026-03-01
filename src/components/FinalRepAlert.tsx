import { AlertCircle, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FinalRepAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const FinalRepAlert = ({ isVisible, onDismiss }: FinalRepAlertProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`absolute inset-0 bg-yellow-500/20 backdrop-blur-sm animate-pulse ${
          isVisible ? 'block' : 'hidden'
        }`}
      ></div>

      <div
        className={`relative bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-slate-950 px-12 py-8 rounded-2xl shadow-2xl border-4 border-yellow-300 pointer-events-auto transform transition-all duration-300 shadow-[0_0_60px_rgba(250,204,21,0.8)] ${
          isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
        }`}
        onClick={onDismiss}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <AlertCircle className="w-20 h-20 text-yellow-900/50" />
            </div>
            <AlertCircle className="w-20 h-20 text-slate-950 relative z-10" />
          </div>

          <div className="text-center">
            <h2 className="text-5xl font-black mb-2 tracking-tight animate-pulse text-slate-950">
              LAST REP
            </h2>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900">
              <Zap className="w-6 h-6" />
              <span>35% VELOCITY LOSS</span>
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-2 px-6 py-2 bg-slate-950/20 rounded-full">
            <p className="text-sm font-medium text-slate-900">Neural failure imminent - Make it count</p>
          </div>

          <button
            onClick={onDismiss}
            className="mt-2 px-6 py-2 bg-slate-950 text-yellow-400 rounded-lg font-bold hover:bg-slate-900 transition-colors"
          >
            Acknowledged
          </button>
        </div>

        <div className="absolute -top-2 -right-2 w-24 h-24 bg-yellow-300 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-amber-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      </div>
    </div>
  );
};
