import React, { useMemo } from 'react';
import { CookingHistoryEntry } from '../types';
import { Award, Flame, Clock, Utensils, Zap, Trash2, Calendar, Sparkles } from 'lucide-react';

interface CookingHistoryDashboardProps {
  history: CookingHistoryEntry[];
  onClearHistory: () => void;
  onRemoveEntry: (id: string) => void;
}

export default function CookingHistoryDashboard({
  history,
  onClearHistory,
  onRemoveEntry
}: CookingHistoryDashboardProps) {

  // Calculate stats
  const stats = useMemo(() => {
    const totalCooked = history.length;
    
    let totalCalories = 0;
    let totalPrepTime = 0;
    const difficultyCounts: Record<string, number> = { Fácil: 0, Médio: 0, Difícil: 0 };
    const dietCounts: Record<string, number> = { Fit: 0, 'Fim de Semana': 0, Calórica: 0 };

    history.forEach(entry => {
      totalCalories += (entry.calories || 0) * entry.servings;
      totalPrepTime += 30; // default average if unknown, or can map to actual recipes
      if (entry.difficulty) difficultyCounts[entry.difficulty] = (difficultyCounts[entry.difficulty] || 0) + 1;
      if (entry.diet) dietCounts[entry.diet] = (dietCounts[entry.diet] || 0) + 1;
    });

    const averagePrepTime = totalCooked > 0 ? Math.round(totalPrepTime / totalCooked) : 0;
    
    // Cooking streak calculation (consecutive unique days cooked)
    const cookedDates = history.map(h => h.cookedAt.split('T')[0]);
    const uniqueDates = Array.from(new Set(cookedDates)).sort();
    
    let currentStreak = 0;
    if (uniqueDates.length > 0) {
      currentStreak = 1;
      // Compare consecutive days backwards from today
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // If they cooked today or yesterday, find continuous sequence
      const hasCookedRecently = uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr);
      
      if (hasCookedRecently) {
        let streakCount = 1;
        let checkDate = new Date();
        if (!uniqueDates.includes(todayStr)) {
          checkDate.setDate(checkDate.getDate() - 1); // start from yesterday
        }

        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const formatted = checkDate.toISOString().split('T')[0];
          if (uniqueDates.includes(formatted)) {
            streakCount++;
          } else {
            break;
          }
        }
        currentStreak = streakCount;
      } else {
        currentStreak = 0;
      }
    }

    return {
      totalCooked,
      totalCalories,
      averagePrepTime,
      difficultyCounts,
      dietCounts,
      currentStreak
    };
  }, [history]);

  // Achievement criteria
  const achievements = useMemo(() => {
    return [
      {
        title: 'Primeiro de Muitos',
        desc: 'Cozinhou sua primeira receita no aplicativo.',
        unlocked: stats.totalCooked >= 1,
        color: 'from-blue-500 to-indigo-500'
      },
      {
        title: 'Cozinheiro Consistente',
        desc: 'Alcance uma sequência de 3 dias seguidos cozinhando.',
        unlocked: stats.currentStreak >= 3,
        color: 'from-orange-500 to-amber-500'
      },
      {
        title: 'Banquete Real',
        desc: 'Prepare refeições que somam mais de 2.000 kcal no total.',
        unlocked: stats.totalCalories >= 2000,
        color: 'from-purple-500 to-pink-500'
      },
      {
        title: 'Mestre da Cozinha',
        desc: 'Prepare 5 ou mais receitas utilizando o sistema.',
        unlocked: stats.totalCooked >= 5,
        color: 'from-emerald-500 to-teal-500'
      }
    ];
  }, [stats]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Overview stats layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-orange-100 text-orange-600 rounded-2xl shrink-0">
            <Utensils size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pratos Cozinhados</span>
            <span className="text-2xl font-mono font-bold text-slate-800">{stats.totalCooked}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Calorias Preparadas</span>
            <span className="text-2xl font-mono font-bold text-slate-800">{stats.totalCalories} kcal</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-100 text-amber-500 rounded-2xl shrink-0">
            <Zap size={24} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sequência Atual</span>
            <span className="text-2xl font-mono font-bold text-slate-800">{stats.currentStreak} dias</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-sky-100 text-sky-600 rounded-2xl shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tempo Médio Ativo</span>
            <span className="text-2xl font-mono font-bold text-slate-800">30 min</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Achievements list (Left Column - 1/3) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <h3 className="font-serif italic font-bold text-lg text-slate-800">Conquistas & Medalhas</h3>
          </div>

          <div className="space-y-3">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  ach.unlocked
                    ? 'bg-white border-slate-100 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100/50 opacity-60'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 text-white bg-gradient-to-br ${
                  ach.unlocked ? ach.color : 'from-slate-300 to-slate-400'
                }`}>
                  <Award size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className={`text-xs font-bold ${ach.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                      {ach.title}
                    </h4>
                    {ach.unlocked && <Sparkles size={11} className="text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {ach.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cooking History Timeline Log (Right Column - 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-600" />
              <h3 className="font-serif italic font-bold text-lg text-slate-800">Histórico de Pratos Preparados</h3>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todo o seu histórico de cozinha?')) {
                    onClearHistory();
                  }
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer p-1"
              >
                <Trash2 size={13} />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Utensils size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-slate-800 font-serif italic font-bold text-base">
                  Seu histórico está vazio!
                </p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Quando você preparar uma receita usando o "Modo Cozinhar Ativo" ou marcá-la como cozinhada, ela aparecerá aqui com as estatísticas nutricionais.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <img
                      src={entry.recipeImage}
                      alt={entry.recipeTitle}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {entry.recipeTitle}
                      </h4>
                      <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-1 font-medium flex-wrap">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {entry.servings} {entry.servings === 1 ? 'porção' : 'porções'}
                        </span>
                        <span>•</span>
                        <span className="text-rose-500 font-semibold font-mono">
                          {entry.calories ? `${entry.calories * entry.servings} kcal` : '--'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(entry.cookedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveEntry(entry.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shrink-0 cursor-pointer"
                    title="Remover do Histórico"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
