import React from 'react';
import { usePokerStore } from '../../store/gameStore';
import { Info, XCircle, CheckCircle } from 'lucide-react';

export const AdvisorFeedbackUI: React.FC = () => {
  const { lastFeedback, clearFeedback } = usePokerStore();

  if (!lastFeedback) return null;

  const { isCorrect, advice, severity, expectedSizing, potOdds, equity } = lastFeedback;

  return (
    <div className={`
      fixed bottom-40 right-8 max-w-sm w-full p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md transition-all animate-in slide-in-from-right fade-in duration-300
      ${isCorrect ? 'bg-green-900/40 border-green-500/50 text-green-100' : 
        severity === 'major' ? 'bg-red-900/40 border-red-500/50 text-red-100' : 
        'bg-yellow-900/40 border-yellow-500/50 text-yellow-100'}
    `}>
      <div className="flex items-start gap-3">
        {isCorrect ? <CheckCircle className="text-green-400 shrink-0" /> : 
         severity === 'major' ? <XCircle className="text-red-400 shrink-0" /> : 
         <Info className="text-yellow-400 shrink-0" />}
        
        <div className="flex-1">
          <h4 className="font-black uppercase tracking-tighter mb-1">
            {isCorrect ? 'Excellent' : severity === 'major' ? 'Major Error' : 'Better Action Available'}
          </h4>
          <p className="text-sm font-medium leading-relaxed opacity-90">{advice}</p>

          {(expectedSizing || potOdds !== undefined || equity !== undefined) && (
            <div className="mt-3 pt-3 border-t border-white/10 flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              {expectedSizing && (
                <div className="flex flex-col">
                  <span className="text-white/40 mb-0.5">Recommended Sizing</span>
                  <span className="text-blue-400">{expectedSizing}</span>
                </div>
              )}
              {potOdds !== undefined && (
                <div className="flex flex-col">
                  <span className="text-white/40 mb-0.5">Pot Odds (BE%)</span>
                  <span className="text-yellow-400">{potOdds.toFixed(1)}%</span>
                </div>
              )}
              {equity !== undefined && (
                <div className="flex flex-col">
                  <span className="text-white/40 mb-0.5">Your Equity</span>
                  <span className="text-green-400">{equity.toFixed(1)}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={clearFeedback}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <XCircle size={16} />
        </button>
      </div>
    </div>
  );
};

