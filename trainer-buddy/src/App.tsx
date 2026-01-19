import React from 'react';
import { PokerTable } from './components/Table/PokerTable';
import { ActionPanel } from './components/Actions/ActionPanel';
import { AdvisorFeedbackUI } from './components/Advisor/AdvisorFeedback';
import { StatisticsPanel } from './components/Stats/StatisticsPanel';

function App() {
  return (
    <div className="min-h-screen w-full bg-[#121212] p-8 flex flex-col items-center justify-center font-sans text-white">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
          POKER TRAINER BUDDY
        </h1>
        <p className="text-gray-400 font-medium">Master the art of Texas No-Limit Hold'em</p>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-12 gap-8 items-start">
        <main className="col-span-9 flex flex-col gap-6">
          <div className="aspect-[16/9] w-full">
            <PokerTable />
          </div>
          
          <div className="h-32 bg-gray-900/50 rounded-3xl border border-white/5 backdrop-blur-sm flex items-center justify-center">
            <ActionPanel />
          </div>
        </main>

        <aside className="col-span-3 h-full min-h-[600px]">
          <StatisticsPanel />
        </aside>
      </div>

      <AdvisorFeedbackUI />

      <footer className="mt-8 flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Training Mode
        </div>
        <div>V0.1.0-alpha</div>
      </footer>
    </div>
  );
}

export default App;
