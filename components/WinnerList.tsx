import React, { useMemo } from 'react';
import { Winner } from '../types';

interface WinnerListProps {
  winners: Winner[];
  onClear: () => void;
}

const WinnerList: React.FC<WinnerListProps> = ({ winners, onClear }) => {
  
  // Group winners by category
  const groupedWinners = useMemo(() => {
    const groups: Record<string, Winner[]> = {};
    winners.forEach(w => {
      if (!groups[w.category]) {
        groups[w.category] = [];
      }
      groups[w.category].push(w);
    });
    return groups;
  }, [winners]);

  const categories = Object.keys(groupedWinners);

  const handleExport = () => {
    if (winners.length === 0) return;

    const headers = ["Name", "Category", "Time"];
    const rows = winners.map(w => [
        `"${w.name.replace(/"/g, '""')}"`,
        `"${w.category.replace(/"/g, '""')}"`,
        `"${new Date(w.timestamp).toLocaleString()}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `spin_winners_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (winners.length === 0) return null;

  return (
    <section 
      aria-labelledby="winners-heading"
      className="w-full bg-slate-900/60 border border-red-900/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
        <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <h3 id="winners-heading" className="text-xl font-bold text-yellow-500 uppercase tracking-wider shadow-black drop-shadow-sm">
              Winners History
            </h3>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            aria-label="Export winners to CSV"
            className="flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2 bg-green-900/40 hover:bg-green-900/60 text-green-400 hover:text-green-300 border border-green-900/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            Export CSV
          </button>
          <button 
            onClick={onClear}
            aria-label="Clear all winner history"
            className="flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear All
          </button>
        </div>
      </div>
      
      {/* Grid Layout for Categories */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
        role="region"
        aria-label="Winner categories grid"
      >
        {categories.map((category, idx) => (
          <div 
            key={category}
            className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-0 overflow-hidden shadow-lg flex flex-col max-h-96"
            role="group"
            aria-labelledby={`cat-header-${idx}`}
          >
            <div className="bg-slate-900/50 p-3 border-b border-slate-700/50">
                <h4 
                id={`cat-header-${idx}`}
                className="font-bold text-red-400 text-sm uppercase tracking-wide truncate" 
                title={category}
                >
                {category}
                </h4>
            </div>

            <ul 
              className="flex flex-col p-2 gap-2 overflow-y-auto custom-scrollbar flex-1"
              role="list"
              aria-label={`Winners for ${category}`}
            >
              {groupedWinners[category].slice().reverse().map((winner) => (
                <li 
                  key={winner.id}
                  className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/30 text-sm text-slate-200 flex justify-between items-center animate-fade-in hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-semibold truncate mr-2 text-yellow-50">{winner.name}</span>
                  <span className="text-xs text-slate-500 font-mono" aria-label={`Time: ${new Date(winner.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>
                    {new Date(winner.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
             <div className="p-2 bg-slate-900/30 border-t border-slate-700/30 text-center">
                <span className="text-xs text-slate-500 font-medium">Total: {groupedWinners[category].length}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WinnerList;