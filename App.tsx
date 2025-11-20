import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Undo2, Lightbulb, HelpCircle, Sparkles, Trophy } from 'lucide-react';
import { NumberItem, Operator, GameHistoryStep } from './types';
import { generateSolvableNumbers, calculateResult } from './utils/mathUtils';
import { getHintFromAI, getSolutionFromAI } from './services/geminiService';
import { NumberCard } from './components/NumberCard';
import { Button } from './components/Button';

// Helper to create unique IDs
const uid = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- State ---
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [history, setHistory] = useState<GameHistoryStep[]>([]);
  
  // Game Flow
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  
  // UI State
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [aiSolution, setAiSolution] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  // --- Initialization ---
  const startNewGame = useCallback(() => {
    const rawNums = generateSolvableNumbers();
    const newItems = rawNums.map(n => ({
      id: uid(),
      value: n,
      label: n.toString()
    }));
    setNumbers(newItems);
    setHistory([]);
    setSelectedId(null);
    setSelectedOperator(null);
    setGameWon(false);
    setHint(null);
    setAiSolution(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // --- Game Logic ---

  const handleNumberClick = (id: string) => {
    if (gameWon) return;

    // Case 1: No selection yet
    if (!selectedId) {
      setSelectedId(id);
      return;
    }

    // Case 2: Deselect self
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedOperator(null);
      return;
    }

    // Case 3: Selecting second number (Action!)
    if (selectedId && selectedOperator) {
      const numA = numbers.find(n => n.id === selectedId);
      const numB = numbers.find(n => n.id === id);

      if (numA && numB) {
        performOperation(numA, numB, selectedOperator);
      }
    } else {
      // Just switching selection if no operator picked yet
      setSelectedId(id);
    }
  };

  const performOperation = (a: NumberItem, b: NumberItem, op: Operator) => {
    const resultValue = calculateResult(a.value, b.value, op);
    
    if (resultValue === null) {
      // Division by zero or invalid op
      return;
    }

    // Save history for undo
    const currentStep: GameHistoryStep = {
      numbers: [...numbers],
      description: `${a.label} ${op} ${b.label}`
    };
    setHistory([...history, currentStep]);

    // Create new number item
    const newItem: NumberItem = {
      id: uid(),
      value: resultValue,
      label: `(${a.label} ${op} ${b.label})` // basic label tracking, optional
    };

    // Filter out used numbers, add new one
    const remaining = numbers.filter(n => n.id !== a.id && n.id !== b.id);
    const newNumbers = [...remaining, newItem];

    setNumbers(newNumbers);
    
    // Reset Selection
    setSelectedId(newItem.id); // Auto-select result for speed
    setSelectedOperator(null);

    // Check Win
    if (newNumbers.length === 1) {
      if (Math.abs(resultValue - 24) < 0.001) {
        setGameWon(true);
        setSelectedId(null);
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const lastStep = history[history.length - 1];
    setNumbers(lastStep.numbers);
    setHistory(history.slice(0, -1));
    setSelectedId(null);
    setSelectedOperator(null);
    setGameWon(false);
  };

  // --- AI Interactions ---

  const handleGetHint = async () => {
    if (numbers.length < 2) return;
    setHintLoading(true);
    const currentValues = numbers.map(n => n.value);
    const hintText = await getHintFromAI(currentValues);
    setHint(hintText);
    setHintLoading(false);
  };

  const handleSolve = async () => {
    // We solve based on the original numbers from history[0] if exists, else current
    // But technically solvable from current state is what user needs.
    const values = numbers.map(n => n.value);
    setHintLoading(true);
    const sol = await getSolutionFromAI(values);
    setAiSolution(sol);
    setHintLoading(false);
  };

  // --- Render Helpers ---

  const renderOperator = (op: Operator) => (
    <button
      key={op}
      disabled={!selectedId || gameWon}
      onClick={() => setSelectedOperator(op)}
      className={`
        w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold transition-all
        ${selectedOperator === op 
          ? 'bg-game-accent text-game-dark scale-110 ring-4 ring-game-accent/30 shadow-[0_0_20px_rgba(56,189,248,0.5)]' 
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
        }
        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800
      `}
    >
      {op}
    </button>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-game-dark to-black">
      
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-4xl z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-game-accent rounded-lg flex items-center justify-center text-game-dark font-black text-xl shadow-lg shadow-game-accent/20">
            24
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 hidden md:block">Challenge</h1>
        </div>
        
        <div className="flex gap-2">
           <Button variant="secondary" onClick={startNewGame} icon={<RefreshCw size={18} />}>
             Reset
           </Button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-xl flex flex-col items-center gap-8 z-10">
        
        {/* Hint Area */}
        <div className="h-16 w-full flex items-center justify-center text-center px-4">
           {gameWon ? (
             <div className="animate-slide-up bg-game-success/20 text-game-success px-6 py-3 rounded-full border border-game-success/30 flex items-center gap-2 backdrop-blur-sm">
               <Trophy size={20} />
               <span className="font-bold">Solved! Result is 24.</span>
             </div>
           ) : (
             (hint || aiSolution) && (
               <div className="animate-fade-in bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm shadow-xl">
                 <span className="text-game-accent font-semibold mr-2">AI:</span>
                 {aiSolution || hint}
               </div>
             )
           )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 w-full px-4 md:px-0">
          {numbers.map((num) => (
            <NumberCard
              key={num.id}
              item={num}
              isSelected={selectedId === num.id}
              onClick={() => handleNumberClick(num.id)}
              disabled={gameWon}
            />
          ))}
        </div>

        {/* Operators Bar */}
        <div className="flex gap-4 md:gap-6 items-center justify-center py-4">
          {renderOperator(Operator.ADD)}
          {renderOperator(Operator.SUBTRACT)}
          {renderOperator(Operator.MULTIPLY)}
          {renderOperator(Operator.DIVIDE)}
        </div>

        {/* Controls */}
        <div className="flex w-full gap-4 justify-center px-4">
          <Button 
            variant="secondary" 
            onClick={handleUndo} 
            disabled={history.length === 0 || gameWon}
            className="flex-1"
            icon={<Undo2 size={18} />}
          >
            Undo
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleGetHint} 
            loading={hintLoading}
            disabled={gameWon || numbers.length < 2}
            className="flex-1"
            icon={<Lightbulb size={18} className={hint ? "text-yellow-400" : ""} />}
          >
            Hint
          </Button>

           <Button 
            variant="secondary" 
            onClick={handleSolve} 
            loading={hintLoading}
            disabled={gameWon || numbers.length < 2}
            className="flex-1"
            icon={<Sparkles size={18} className="text-purple-400" />}
          >
            Solve
          </Button>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

    </div>
  );
};

export default App;
