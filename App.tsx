
import React, { useState, useRef, useMemo, useEffect } from 'react';
import WheelCanvas, { WheelRef } from './components/WheelCanvas';
import Controls from './components/Controls';
import ResultModal from './components/ResultModal';
import WinnerList from './components/WinnerList';
import SnowEffect from './components/SnowEffect';
import { Winner } from './types';

// Initial data with Office assignments
const INITIAL_DATA = `Ali | HR
Beatriz | Accounting
Charles | Engineering
Diya | HR
Eric | Marketing
Fatima | Accounting
Gabriel | Engineering
Hana | Executive
Ivan | Marketing
Jasmine | HR
Kai | Engineering
Liam | Accounting
Mia | HR
Noah | Operations
Olivia | Marketing
Priya | Engineering
Quinn | Operations
Rohan | Executive
Sofia | HR
Thomas | Accounting
Uma | Marketing
Victor | Operations
Wei | Engineering
Xara | Executive
Yara | HR
Zack | Operations`;

interface Entry {
  name: string;
  office: string;
  originalLine: string;
}

const App: React.FC = () => {
  // We now store the raw text as the source of truth
  const [rawText, setRawText] = useState<string>(INITIAL_DATA);
  const [currentWinners, setCurrentWinners] = useState<string[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [category, setCategory] = useState("Round 1");
  const [spinCount, setSpinCount] = useState(1);
  const [selectedOffice, setSelectedOffice] = useState("All Offices");
  
  const wheelRef = useRef<WheelRef>(null);

  // Parse raw text into structured entries
  const allEntries = useMemo<Entry[]>(() => {
    return rawText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Support "Name | Office" or just "Name"
        const parts = line.split('|');
        const name = parts[0].trim();
        // If no delimiter, default to 'General'
        const office = parts.length > 1 ? parts[1].trim() : 'General';
        return { name, office, originalLine: line };
      });
  }, [rawText]);

  // Extract unique offices for the dropdown
  const offices = useMemo(() => {
    const distinct = Array.from(new Set(allEntries.map(e => e.office))).sort();
    return ['All Offices', ...distinct];
  }, [allEntries]);

  // Filter entries based on selection
  const activeEntries = useMemo(() => {
    if (selectedOffice === 'All Offices') return allEntries;
    return allEntries.filter(e => e.office === selectedOffice);
  }, [allEntries, selectedOffice]);

  // Extract just the names for the wheel
  const activeNames = useMemo(() => activeEntries.map(e => e.name), [activeEntries]);

  // Reset selection if the selected office no longer exists
  useEffect(() => {
    if (selectedOffice !== 'All Offices' && !offices.includes(selectedOffice)) {
      setSelectedOffice('All Offices');
    }
  }, [offices, selectedOffice]);

  // Trigger spin on wheel
  const handleSpin = () => {
    if (wheelRef.current && activeNames.length > 0) {
      setCurrentWinners([]);
      wheelRef.current.spin();
    }
  };

  // Called by wheel when physics stop
  const handleSpinFinished = (primaryWinnerName: string) => {
    // Start with the name the wheel actually landed on
    const batchNames = [primaryWinnerName];
    
    // If we need multiple winners, pick them randomly from the remaining ACTIVE list
    if (spinCount > 1) {
        // Create a pool excluding the primary winner
        const pool = activeNames.filter(n => n !== primaryWinnerName);
        // Shuffle pool
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        // Take needed amount
        const extras = shuffled.slice(0, spinCount - 1);
        batchNames.push(...extras);
    }

    setCurrentWinners(batchNames);
    setIsSpinning(false);
    
    // Create winner objects (find their office info)
    const newHistoryEntries: Winner[] = batchNames.map(name => {
      // Find the entry to get the correct office
      const entry = activeEntries.find(e => e.name === name);
      return {
        id: crypto.randomUUID(),
        name: name,
        category: category || 'General',
        office: entry?.office || 'General',
        timestamp: Date.now()
      };
    });
    
    setWinners(prev => [...prev, ...newHistoryEntries]);
  };

  const handleModalClose = () => {
    if (removeWinner && currentWinners.length > 0) {
      // Remove winners from the RAW text to preserve structure of other lines
      const lines = rawText.split('\n');
      const newLines = lines.filter(line => {
        const parts = line.split('|');
        const name = parts[0].trim();
        return !currentWinners.includes(name);
      });
      setRawText(newLines.join('\n'));
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
            {activeNames.length} active entries <span className="opacity-50">(of {allEntries.length})</span> • 
            Spinning for: <span className="text-yellow-400 font-bold">{selectedOffice}</span> • 
            Prize: <span className="text-green-400">{category || 'General'}</span>
          </p>
        </header>
        
        {/* Wheel Section */}
        <div className="shrink-0 min-h-[500px] h-[60vh] p-4 flex items-center justify-center">
          <div className="w-full h-full max-w-3xl aspect-square relative">
            <WheelCanvas 
              ref={wheelRef}
              items={activeNames} 
              onFinished={handleSpinFinished}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </div>
        </div>

        {/* Winners List */}
        <div className="p-4 md:p-8 w-full">
           <WinnerList winners={winners} onClear={() => setWinners([])} />
        </div>
      </main>

      {/* Right: Sidebar Controls */}
      <aside className="w-full lg:w-96 shrink-0 h-auto lg:h-full z-20 shadow-2xl relative">
        <Controls 
          rawText={rawText}
          setRawText={setRawText}
          offices={offices}
          selectedOffice={selectedOffice}
          setSelectedOffice={setSelectedOffice}
          onSpin={handleSpin}
          isSpinning={isSpinning}
          removeWinner={removeWinner}
          setRemoveWinner={setRemoveWinner}
          category={category}
          setCategory={setCategory}
          spinCount={spinCount}
          setSpinCount={setSpinCount}
          activeCount={activeNames.length}
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
