import React, { useState } from 'react';
import { PantryItem, Recipe, RecipeDifficulty, RecipeDiet, RecipeCategory } from '../types';
import { Sparkles, ChefHat, Check, RotateCcw, AlertTriangle, Play, HelpCircle } from 'lucide-react';

interface ChefAIPanelProps {
  pantry: PantryItem[];
  onRecipeGenerated: (recipe: Recipe) => void;
}

const LOADING_STEPS = [
  'Avaliando ingredientes disponíveis...',
  'Filtrando combinações nutritivas...',
  'Chef IA elaborando o passo a passo...',
  'Ajustando temperos e cozimento...',
  'Finalizando apresentação do prato...'
];

export default function ChefAIPanel({ pantry, onRecipeGenerated }: ChefAIPanelProps) {
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    pantry.filter(i => i.quantity > 0).slice(0, 6).map(i => i.id) // pre-select up to 6 available items
  );
  
  const [diet, setDiet] = useState<RecipeDiet>('Fit');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('Médio');
  const [category, setCategory] = useState<RecipeCategory>('Dia a Dia');
  
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Toggle selection
  const handleToggleIngredient = (id: string) => {
    if (selectedIngredientIds.includes(id)) {
      setSelectedIngredientIds(selectedIngredientIds.filter(item => item !== id));
    } else {
      setSelectedIngredientIds([...selectedIngredientIds, id]);
    }
  };

  // Cycle loading phrases to make the wait pleasant
  const runLoadingAnimation = () => {
    setLoadingStepIdx(0);
    const interval = setInterval(() => {
      setLoadingStepIdx(prev => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 2200);
    return interval;
  };

  const handleGenerate = async () => {
    setErrorMsg('');
    
    const chosenIngredients = pantry.filter(item => selectedIngredientIds.includes(item.id));
    
    if (chosenIngredients.length === 0) {
      setErrorMsg('Por favor, selecione pelo menos 1 ingrediente da sua despensa para guiar o Chef IA.');
      return;
    }

    setLoading(true);
    const animationInterval = runLoadingAnimation();

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: chosenIngredients,
          diet,
          difficulty,
          category
        })
      });

      if (!response.ok) {
        let errorDetails = 'Falha ao comunicar com o servidor de IA.';
        try {
          const errData = await response.json();
          errorDetails = errData.error || errData.details || errorDetails;
        } catch {
          errorDetails = 'O servidor Node.js/Express não está ativo nesta hospedagem estática (GitHub Pages). As funções locais (catálogo, despensa, cardápio, timers, histórico) funcionam 100%, mas para usar o Chef IA com Gemini é necessário rodar com backend Node.';
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();

      onRecipeGenerated(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Houve um erro técnico de comunicação. Certifique-se de configurar a API Key.');
    } finally {
      clearInterval(animationInterval);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 max-w-3xl mx-auto">
      
      {/* Loading state block */}
      {loading ? (
        <div className="py-16 text-center space-y-6 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Spinning background circle */}
            <div className="absolute inset-0 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
            {/* Pulsing inner icon */}
            <ChefHat size={36} className="text-orange-500 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h4 className="font-serif italic font-bold text-slate-800 text-lg">
              {LOADING_STEPS[loadingStepIdx]}
            </h4>
            <p className="text-xs text-slate-400 font-light">
              Isso pode levar alguns segundos. O Chef IA está construindo a receita perfeita sob medida para você...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Default generation panel interface */}
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <Sparkles size={24} className="animate-pulse text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-serif italic font-bold text-slate-800">
                Chef IA: Criador de Receitas Personalizadas
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gere receitas exclusivas baseadas exatamente no estoque que você possui na despensa agora!
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start gap-2 leading-relaxed">
              <AlertTriangle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Erro ao gerar receita</p>
                <p className="text-slate-500 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left side: ingredient selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400">
                  Selecionar Ingredientes Disponíveis
                </label>
                <span className="text-[11px] text-purple-600 font-medium">
                  {selectedIngredientIds.length} selecionado(s)
                </span>
              </div>

              {pantry.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  Sua despensa está vazia. Adicione itens antes para usá-los aqui!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 pb-1">
                  {pantry.map(item => {
                    const isSelected = selectedIngredientIds.includes(item.id);
                    const isOutOfStock = item.quantity === 0;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleIngredient(item.id)}
                        disabled={isOutOfStock}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-purple-300 bg-purple-50/50 text-purple-900'
                            : isOutOfStock
                            ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="truncate pr-1">{item.name}</span>
                        {isSelected ? (
                          <Check size={12} className="text-purple-600 shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            {item.quantity} {item.unit}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side: diet and filters */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-2">
                  Tipo de Dieta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fit', 'Fim de Semana', 'Calórica'] as RecipeDiet[]).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiet(d)}
                      className={`py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        diet === d
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-2">
                  Nível de Dificuldade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Fácil', 'Médio', 'Difícil'] as RecipeDifficulty[]).map(dif => (
                    <button
                      key={dif}
                      type="button"
                      onClick={() => setDifficulty(dif)}
                      className={`py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        difficulty === dif
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {dif}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-2">
                  Ocasião
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Dia a Dia', 'Domingo'] as RecipeCategory[]).map(catItem => (
                    <button
                      key={catItem}
                      type="button"
                      onClick={() => setCategory(catItem)}
                      className={`py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        category === catItem
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {catItem}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={selectedIngredientIds.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Sparkles size={18} className="text-yellow-300 shrink-0" />
            <span>Gerar Receita Exclusiva com Chef IA ✦</span>
          </button>
        </>
      )}

    </div>
  );
}
