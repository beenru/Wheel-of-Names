import React, { useState, useRef } from 'react';
import WheelCanvas, { WheelRef } from './components/WheelCanvas';
import Controls from './components/Controls';
import ResultModal from './components/ResultModal';
import WinnerList from './components/WinnerList';
import SnowEffect from './components/SnowEffect';
import { Winner } from './types';

// Initial dummy data
const INITIAL_NAMES = [
  "Ali", "Beatriz", "Charles", "Diya", "Eric", "Fatima", 
  "Gabriel", "Hana", "Ivan", "Jasmine", "Kai", "Liam",
  "Mia", "Noah", "Olivia", "Priya", "Quinn", "Rohan",
  "Sofia", "Thomas", "Uma", "Victor", "Wei", "Xara",
  "Yara", "Zack"
];

const App: React.FC = () => {
  const [names, setNames] = useState<string[]>(INITIAL_NAMES);
  const [currentWinners, setCurrentWinners] = useState<string[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [category, setCategory] = useState("Round 1");
  const [spinCount, setSpinCount] = useState(1);
  
  const wheelRef = useRef<WheelRef>(null);

  // Trigger spin on wheel
  const handleSpin = () => {
    if (wheelRef.current) {
      setCurrentWinners([]);
      wheelRef.current.spin();
    }
  };

  // Called by wheel when physics stop
  const handleSpinFinished = (primaryWinner: string) => {
    // Start with the name the wheel actually landed on
    const batchWinners = [primaryWinner];
    
    // If we need multiple winners, pick them randomly from the remaining list
    if (spinCount > 1) {
        // Create a pool excluding the primary winner
        const pool = names.filter(n => n !== primaryWinner);
        
        // Shuffle pool
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        
        // Take needed amount (subtract 1 because we already have the primary winner)
        const extras = shuffled.slice(0, spinCount - 1);
        batchWinners.push(...extras);
    }

    setCurrentWinners(batchWinners);
    setIsSpinning(false);
    
    // Add to history
    const newHistoryEntries: Winner[] = batchWinners.map(name => ({
        id: crypto.randomUUID(),
        name: name,
        category: category || 'General',
        timestamp: Date.now()
    }));
    
    setWinners(prev => [...prev, ...newHistoryEntries]);
  };

  const handleModalClose = () => {
    if (removeWinner && currentWinners.length > 0) {
      setNames(prev => prev.filter(n => !currentWinners.includes(n)));
    }
    setCurrentWinners([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-gradient-to-br from-green-950 via-slate-900 to-red-950 text-white relative">
      <SnowEffect />
      
      {/* Left: Scrollable Content Area */}
      <main className="flex-1 relative flex flex-col z-10 overflow-y-auto custom-scrollbar h-full">
        <header className="p-6 md:p-8 w-full shrink-0">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 drop-shadow-sm filter">
            PROVINCIAL GOVERNMENT OF NEGROS ORIENTAL
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-2">
            {names.length} active entries • Category: <span className="text-yellow-400">{category || 'General'}</span>
          </p>
        </header>
        
        {/* Wheel Section - Fixed height constraint to ensure playability */}
        <div className="shrink-0 min-h-[500px] h-[60vh] p-4 flex items-center justify-center">
          <div className="w-full h-full max-w-3xl aspect-square relative">
            <WheelCanvas 
              ref={wheelRef}
              items={names} 
              onFinished={handleSpinFinished}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </div>
        </div>

        {/* Winners List - Flows naturally below */}
        <div className="p-4 md:p-8 w-full">
           <WinnerList winners={winners} onClear={() => setWinners([])} />
        </div>
      </main>

      {/* Right: Sidebar Controls */}
      <aside className="w-full lg:w-96 shrink-0 h-auto lg:h-full z-20 shadow-2xl relative">
        <Controls 
          names={names}
          setNames={setNames}
          onSpin={handleSpin}
          isSpinning={isSpinning}
          removeWinner={removeWinner}
          setRemoveWinner={setRemoveWinner}
          category={category}
          setCategory={setCategory}
          spinCount={spinCount}
          setSpinCount={setSpinCount}
        />
      </aside>

      {/* Overlays */}
      <ResultModal 
        winners={currentWinners} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default App;