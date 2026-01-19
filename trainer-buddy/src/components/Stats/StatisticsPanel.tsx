import React from 'react';
import { usePokerStore } from '../../store/gameStore';
import { TrendingUp, Target, AlertTriangle, Trophy, Download } from 'lucide-react';
import { downloadCSV, formatDecisionToCSV } from '../../utils/csvExport';

export const StatisticsPanel: React.FC = () => {
  const { decisions, weaknesses, gameState, persistenceEnabled, togglePersistence, resetSession } = usePokerStore();

  const totalDecisions = decisions.length;
  const correctDecisions = decisions.filter(d => d.isCorrect).length;
  const accuracy = totalDecisions > 0 ? Math.round((correctDecisions / totalDecisions) * 100) : 100;

  const vpip = totalDecisions > 0 ? 
    Math.round((decisions.filter(d => d.phase === 'pre-flop' && d.action !== 'fold').length / 
    decisions.filter(d => d.phase === 'pre-flop').length) * 100) : 0;

  const handleExportDecisions = () => {
    const header = "timestamp,hand_id,phase,player_id,action,amount,is_correct,recommended_action\n";
    const csvContent = header + decisions.map(d => formatDecisionToCSV({
      ...d,
      playerId: 'user'
    })).join('');
    downloadCSV(`decisions_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  };

  return (
    <div className="flex flex-col gap-6 h-full p-6 bg-gray-900/40 rounded-3xl border border-white/5 backdrop-blur-md overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-400" size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm">Performance</h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleExportDecisions}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Export Decisions to CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Retain Session Stats</span>
          <button 
            onClick={() => togglePersistence(!persistenceEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative ${persistenceEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${persistenceEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <button 
          onClick={resetSession}
          className="text-[10px] font-bold text-red-400 uppercase hover:text-red-300 transition-colors self-start mt-1"
        >
          Reset All Stats & Chips
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">Accuracy</div>
          <div className="text-2xl font-black text-blue-400">{accuracy}%</div>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">VPIP</div>
          <div className="text-2xl font-black text-purple-400">{vpip}%</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="text-yellow-400" size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm text-yellow-400">Weaknesses</h3>
        </div>
        
        {weaknesses.length === 0 ? (
          <div className="text-gray-500 text-xs italic p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
            Keep playing to identify patterns in your gameplay...
          </div>
        ) : (
          weaknesses.map(w => (
            <div key={w.id} className="p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-2xl">
              <div className="font-bold text-yellow-200 text-sm mb-1">{w.name}</div>
              <div className="text-[10px] text-yellow-100/60 leading-tight">{w.description}</div>
            </div>
          ))
        )}
      </div>

      {gameState && (
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="text-green-400" size={20} />
            <h3 className="font-black uppercase tracking-widest text-sm text-green-400">Current Session</h3>
          </div>
          <div className="text-3xl font-black text-white">
            ${gameState.players.find(p => p.id === 'user')?.chips || 0}
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Total Chips</div>
        </div>
      )}
    </div>
  );
};

