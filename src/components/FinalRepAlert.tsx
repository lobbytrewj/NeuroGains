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
        className={`absolute inset-0 bg-red-500/20 backdrop-blur-sm animate-pulse ${
          isVisible ? 'block' : 'hidden'
        }`}
      ></div>

      <div
        className={`relative bg-gradient-to-br from-red-600 to-rose-700 text-white px-12 py-8 rounded-2xl shadow-2xl border-4 border-red-400 pointer-events-auto transform transition-all duration-300 ${
          isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
        }`}
        onClick={onDismiss}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <AlertCircle className="w-20 h-20 text-red-200" />
            </div>
            <AlertCircle className="w-20 h-20 text-white relative z-10" />
          </div>

          <div className="text-center">
            <h2 className="text-5xl font-black mb-2 tracking-tight animate-pulse">
              LAST REP
            </h2>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Zap className="w-6 h-6" />
              <span>GIVE IT YOUR ALL</span>
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-2 px-6 py-2 bg-white/20 rounded-full">
            <p className="text-sm font-medium">Neural failure threshold reached</p>
          </div>

          <button
            onClick={onDismiss}
            className="mt-2 px-6 py-2 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
          >
            Acknowledged
          </button>
        </div>

        <div className="absolute -top-2 -right-2 w-24 h-24 bg-yellow-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-red-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      </div>
    </div>
  );
};
