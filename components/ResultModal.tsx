import React, { useEffect } from 'react';

interface ResultModalProps {
  winners: string[];
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ winners, onClose }) => {
  useEffect(() => {
    if (winners.length > 0 && window.confetti) {
      // Fire confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Use Christmas Colors for confetti
        const colors = ['#dc2626', '#16a34a', '#fbbf24', '#ffffff'];
        
        window.confetti({ ...defaults, particleCount, colors, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        window.confetti({ ...defaults, particleCount, colors, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [winners]);

  if (winners.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-yellow-600 rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-center transform scale-100 animate-bounce-in relative overflow-hidden flex flex-col max-h-[90vh]">
        
        <h2 className="text-3xl font-bold text-yellow-500 mb-2 drop-shadow-sm">
          {winners.length > 1 ? 'Winners!' : 'We have a winner!'}
        </h2>

        {/* Dynamic Container based on count */}
        <div className={`
          my-4 p-4 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-inner shadow-black/40 border border-red-500 overflow-y-auto custom-scrollbar
          ${winners.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-3 text-left' : 'flex items-center justify-center rotate-1'}
        `}>
          {winners.map((winner, idx) => (
             <div key={idx} className={`${winners.length > 1 ? 'bg-black/20 p-3 rounded border border-white/10' : ''}`}>
               {winners.length > 1 && <span className="text-xs text-yellow-200 block mb-1">#{idx + 1}</span>}
               <h1 className={`${winners.length > 1 ? 'text-xl md:text-2xl' : 'text-4xl md:text-5xl'} font-black text-white break-words drop-shadow-md`}>
                 {winner}
               </h1>
             </div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-green-700 hover:bg-green-600 border border-green-500 text-white rounded-lg font-bold uppercase tracking-wider transition-colors shadow-lg shadow-green-900/50 mt-auto"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ResultModal;