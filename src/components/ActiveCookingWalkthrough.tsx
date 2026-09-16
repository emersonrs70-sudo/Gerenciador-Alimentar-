import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Check, X, Clock, AlertCircle, Award } from 'lucide-react';

interface ActiveCookingWalkthroughProps {
  recipe: Recipe;
  servings: number;
  onClose: () => void;
  onFinishCooking: (deductPantry: boolean) => void;
}

export default function ActiveCookingWalkthrough({
  recipe,
  servings,
  onClose,
  onFinishCooking
}: ActiveCookingWalkthroughProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(
    new Array(recipe.instructions.length).fill(false)
  );

  // Timer States
  const [timerDuration, setTimerDuration] = useState(300); // 5 mins default in seconds
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [deductPantryItems, setDeductPantryItems] = useState(true);

  const steps = recipe.instructions;

  // Handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Simple beep sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1);
      } catch (e) {
        console.warn('AudioContext not supported or blocked by user gesture', e);
      }
      alert('⏰ O timer de cozimento acabou!');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  // Try to parse step text for times (e.g., "cozinhe por 15 minutos", "ferver por 5 min")
  useEffect(() => {
    const stepText = steps[currentStepIdx]?.toLowerCase() || '';
    const minutesMatch = stepText.match(/(\d+)\s*(minutos|min|minute|minutes)/);
    if (minutesMatch && minutesMatch[1]) {
      const minutes = parseInt(minutesMatch[1], 10);
      setTimerDuration(minutes * 60);
      setTimeLeft(minutes * 60);
      setIsTimerRunning(false);
    }
  }, [currentStepIdx, steps]);

  const handleSetPreset = (minutes: number) => {
    setTimerDuration(minutes * 60);
    setTimeLeft(minutes * 60);
    setIsTimerRunning(false);
  };

  const handleCustomTimerChange = (secondsStr: string) => {
    const val = parseInt(secondsStr, 10);
    if (!isNaN(val) && val > 0) {
      setTimerDuration(val * 60);
      setTimeLeft(val * 60);
      setIsTimerRunning(false);
    }
  };

  const toggleStepCheck = (idx: number) => {
    setCheckedSteps(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setShowCelebration(true);
  };

  const handleConfirmFinish = () => {
    onFinishCooking(deductPantryItems);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      
      {!showCelebration ? (
        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh]">
          
          {/* Left panel: Recipe Info & Interactive Step */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-r border-slate-100">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block mb-1">
                  Modo Cozinhar Ativo
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-800 line-clamp-1">
                  {recipe.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Sair do modo cozinhar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step Card Content */}
            <div className="my-auto py-6 space-y-6">
              <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
                <span>PASSO {currentStepIdx + 1} DE {steps.length}</span>
                <span className="text-orange-500 font-bold font-sans">
                  {Math.round((checkedSteps.filter(Boolean).length / steps.length) * 100)}% concluído
                </span>
              </div>

              {/* Step instructions text */}
              <div className="bg-orange-50/30 border border-orange-100/50 p-6 rounded-2xl space-y-4">
                <p className="text-slate-800 text-lg sm:text-xl font-serif leading-relaxed italic">
                  "{steps[currentStepIdx]}"
                </p>

                <button
                  onClick={() => toggleStepCheck(currentStepIdx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    checkedSteps[currentStepIdx]
                      ? 'bg-emerald-500 text-white shadow shadow-emerald-500/15'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Check size={14} className={checkedSteps[currentStepIdx] ? 'scale-110' : 'text-slate-400'} />
                  <span>{checkedSteps[currentStepIdx] ? 'Concluído' : 'Marcar passo como feito'}</span>
                </button>
              </div>

              {/* Step Checklist for keeping track of progress */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Progresso Geral</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStepIdx(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        currentStepIdx === idx
                          ? 'bg-orange-500 text-white border border-orange-600'
                          : checkedSteps[idx]
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-transparent'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation buttons at bottom */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
              <button
                onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                disabled={currentStepIdx === 0}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 transition-all disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Voltar</span>
              </button>

              {currentStepIdx < steps.length - 1 ? (
                <button
                  onClick={() => {
                    // Auto-check the current step upon clicking next to make walkthrough easy
                    if (!checkedSteps[currentStepIdx]) {
                      toggleStepCheck(currentStepIdx);
                    }
                    setCurrentStepIdx(prev => prev + 1);
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Próximo</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer animate-pulse"
                >
                  <Check size={16} />
                  <span>Concluir Receita! ✦</span>
                </button>
              )}
            </div>
          </div>

          {/* Right panel: Kitchen Timer & Ingredients reference */}
          <div className="w-full md:w-80 bg-slate-50 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            {/* Countdown timer tool */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock size={16} className="text-orange-500" />
                <h3 className="font-serif italic font-bold text-sm">Timer de Cozinha</h3>
              </div>

              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-800 tracking-tight">
                  {formatTime(timeLeft)}
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-orange-500 h-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Timer control buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2.5 rounded-xl text-white font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  title={isTimerRunning ? 'Pausar' : 'Iniciar'}
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                </button>

                <button
                  onClick={() => {
                    setTimeLeft(timerDuration);
                    setIsTimerRunning(false);
                  }}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                  title="Reiniciar"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Timer presets */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Ajuste Rápido</span>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-slate-600 text-center">
                  {[1, 3, 5, 10].map(m => (
                    <button
                      key={m}
                      onClick={() => handleSetPreset(m)}
                      className="py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded transition-all cursor-pointer"
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom minute selector */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Minutos"
                  onChange={e => handleCustomTimerChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-mono font-semibold"
                />
              </div>
            </div>

            {/* Ingredients reference block */}
            <div className="mt-6 flex-1 flex flex-col justify-start space-y-3">
              <h4 className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                Ingredientes Necessários ({servings} porções)
              </h4>
              <div className="space-y-2 overflow-y-auto max-h-48 pr-1">
                {recipe.ingredients.map((ing, idx) => {
                  const factor = servings / (recipe.servings || 4);
                  const scaledAmount = Math.round(ing.amount * factor * 10) / 10;
                  return (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 flex justify-between items-center shadow-sm">
                      <span className="font-medium truncate">{ing.name}</span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 font-bold ml-1">
                        {scaledAmount} {ing.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 text-center">
              <span className="text-[10px] text-slate-400 block">Dificuldade: <strong>{recipe.difficulty}</strong></span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Tempo Total: <strong>{recipe.prepTime} minutos</strong></span>
            </div>
          </div>

        </div>
      ) : (
        /* Celebration Overlay View */
        <div className="bg-white rounded-3xl p-8 sm:p-12 w-full max-w-md text-center shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
          {/* Confetti decoration circles */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-orange-100/40 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-100/40 rounded-full blur-3xl -z-10"></div>

          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award size={42} className="animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-slate-800">
              Parabéns, Chef! 🎉
            </h2>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              Você acabou de preparar com sucesso o prato: <br />
              <strong className="text-slate-800 font-serif italic">"{recipe.title}"</strong>!
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="deductPantry"
                checked={deductPantryItems}
                onChange={e => setDeductPantryItems(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 mt-0.5"
              />
              <label htmlFor="deductPantry" className="text-xs text-slate-700 font-medium cursor-pointer">
                Deduzir ingredientes da despensa automaticamente
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                  Subtrai as quantidades necessárias das porções preparadas do seu estoque.
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleConfirmFinish}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Confirmar e Salvar no Histórico
            </button>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Voltar ao modo passo a passo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
