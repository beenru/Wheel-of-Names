
import React, { useState } from 'react';

interface ControlsProps {
  rawText: string;
  setRawText: (text: string) => void;
  offices: string[];
  selectedOffice: string;
  setSelectedOffice: (office: string) => void;
  onSpin: () => void;
  isSpinning: boolean;
  removeWinner: boolean;
  setRemoveWinner: (val: boolean) => void;
  category: string;
  setCategory: (val: string) => void;
  spinCount: number;
  setSpinCount: (val: number) => void;
  activeCount: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  rawText,
  setRawText,
  offices,
  selectedOffice,
  setSelectedOffice,
  onSpin, 
  isSpinning,
  removeWinner,
  setRemoveWinner,
  category,
  setCategory,
  spinCount,
  setSpinCount,
  activeCount
}) => {
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle

  const handleShuffle = () => {
    // Shuffle lines but keep them intact (name | office)
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const shuffled = [...lines].sort(() => Math.random() - 0.5);
    setRawText(shuffled.join('\n'));
  };

  const handleSort = () => {
    const lines = rawText.split('\n').filter(l => l.trim().length > 0);
    const sorted = [...lines].sort((a, b) => a.localeCompare(b));
    setRawText(sorted.join('\n'));
  };

  const handleClear = () => {
    if(window.confirm("Are you sure you want to clear all names?")) {
      setRawText('');
    }
  };

  const handleSpinCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setSpinCount(val);
    }
  };

  return (
    <div className={`
      flex flex-col h-full bg-slate-900/90 border-r border-red-900/30 backdrop-blur-sm
      transition-all duration-300 ease-in-out z-20
      ${isOpen ? 'absolute inset-0 w-full' : 'relative w-full lg:w-96'}
      lg:relative lg:flex lg:h-full lg:w-96 shadow-2xl
    `}>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden p-4 flex justify-between items-center bg-red-950 border-b border-red-900">
        <h2 className="font-bold text-lg text-white">Controls</h2>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-red-200 hover:text-white"
        >
          {isOpen ? 'Close' : 'Edit Names'}
        </button>
      </div>

      <div className={`flex-1 flex flex-col p-6 gap-5 ${!isOpen && 'hidden lg:flex'}`}>
        
        {/* Main Spin Controls */}
        <div className="flex flex-col gap-4">
          
          {/* Target Office Selector */}
          <div>
            <label className="block text-xs font-bold text-red-300 uppercase tracking-wider mb-2">
              Target Office
            </label>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              disabled={isSpinning}
              className="w-full bg-slate-800 border border-red-900/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all cursor-pointer"
            >
              {offices.map(office => (
                <option key={office} value={office}>{office}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-red-300 uppercase tracking-wider mb-2">
              Prize / Category
            </label>
            <input 
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-red-900/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder-slate-500"
              placeholder="e.g. Major Prize 1"
            />
          </div>

          <button
            onClick={onSpin}
            disabled={isSpinning || activeCount === 0}
            className={`
              py-4 px-6 rounded-xl font-black text-xl tracking-wider shadow-lg
              transform transition hover:-translate-y-1 active:translate-y-0
              border border-white/10 relative overflow-hidden group
              ${isSpinning || activeCount === 0 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white hover:from-red-500 hover:to-red-500 shadow-red-900/50'}
            `}
          >
            <span className="relative z-10">
              {isSpinning ? 'SPINNING...' : (spinCount > 1 ? `DRAW ${spinCount}` : 'SPIN')}
            </span>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <div className="grid grid-cols-2 gap-3">
             {/* Winner Removal Toggle */}
            <div className="flex flex-col justify-center p-3 bg-slate-800/50 rounded-lg border border-red-900/30">
                <label className="text-xs font-medium text-slate-400 mb-1" htmlFor="remove-toggle">
                Remove Winner
                </label>
                <div className="flex items-center">
                    <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                        <input 
                        type="checkbox" 
                        name="toggle" 
                        id="remove-toggle" 
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                        style={{ right: removeWinner ? '0' : '50%', borderColor: removeWinner ? '#16a34a' : '#64748b' }}
                        checked={removeWinner}
                        onChange={(e) => setRemoveWinner(e.target.checked)}
                        />
                        <label 
                        htmlFor="remove-toggle" 
                        className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${removeWinner ? 'bg-green-600' : 'bg-slate-600'}`}
                        ></label>
                    </div>
                </div>
            </div>

            {/* Spin Count Input */}
            <div className="flex flex-col p-3 bg-slate-800/50 rounded-lg border border-red-900/30">
                <label className="text-xs font-medium text-slate-400 mb-1" htmlFor="spin-count">
                    Draw Count
                </label>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        id="spin-count"
                        min="1" 
                        max="100"
                        value={spinCount}
                        onChange={handleSpinCountChange}
                        className="w-full bg-slate-900 text-white text-sm border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-green-500 outline-none font-mono"
                    />
                </div>
            </div>
          </div>
        </div>

        {/* List Editor */}
        <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-800/50">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-300">
                Entries
              </span>
              <span className="text-[10px] text-slate-500">Format: Name | Office</span>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleShuffle} className="p-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300" title="Shuffle">
                Shuffle
              </button>
               <button onClick={handleSort} className="p-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300" title="Sort A-Z">
                A-Z
              </button>
              <button onClick={handleClear} className="p-1.5 text-xs bg-red-950 hover:bg-red-900 border border-red-900 text-red-400 rounded" title="Clear All">
                Clear
              </button>
            </div>
          </div>
          
          <textarea
            className="flex-1 w-full p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none font-mono text-sm leading-relaxed"
            placeholder="John Doe | HR&#10;Jane Smith | Accounting"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isSpinning}
            spellCheck={false}
          />
          <div className="text-right mt-1">
             <span className="text-xs text-slate-500">{activeCount} active on wheel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
