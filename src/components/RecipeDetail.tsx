import React, { useState } from 'react';
import { Recipe, PantryItem, ShoppingListItem } from '../types';
import { Clock, Users, Flame, Heart, ArrowLeft, Check, Plus, AlertCircle, ShoppingBag, Sparkles, ChefHat, Trash2, Play, HelpCircle, RefreshCw, Edit3, X } from 'lucide-react';
import { checkIngredientInPantry } from '../utils';

interface RecipeDetailProps {
  recipe: Recipe;
  pantry: PantryItem[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToShoppingList: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void;
  onClose: () => void;
  onStartCooking: (recipe: Recipe, servings: number) => void;
  onRecipeAdapted: (newRecipe: Recipe) => void;
  onDeleteRecipe?: (id: string) => void;
  onEditRecipe?: (recipe: Recipe) => void;
}

export default function RecipeDetail({
  recipe,
  pantry,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
  onClose,
  onStartCooking,
  onRecipeAdapted,
  onDeleteRecipe,
  onEditRecipe
}: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings || 4);
  const scaleFactor = servings / (recipe.servings || 4);

  // AI Adaptations State
  const [selectedDietGoal, setSelectedDietGoal] = useState('Vegana');
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationError, setAdaptationError] = useState<string | null>(null);

  const handleAdaptRecipe = async () => {
    setIsAdapting(true);
    setAdaptationError(null);
    try {
      const response = await fetch('/api/adapt-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe, dietGoal: selectedDietGoal })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao adaptar receita com IA.');
      }
      const adapted: Recipe = await response.json();
      onRecipeAdapted(adapted);
      alert(`Receita adaptada com sucesso para versão: ${selectedDietGoal}!`);
    } catch (err: any) {
      console.error(err);
      setAdaptationError(err.message || 'Erro de conexão.');
    } finally {
      setIsAdapting(false);
    }
  };

  const isCustomRecipe = recipe.id.startsWith('custom-');

  // Status of each ingredient relative to pantry stock
  const ingredientStatuses = recipe.ingredients.map(ing => {
    const scaledAmount = Math.round(ing.amount * scaleFactor * 10) / 10;
    const { pantryItem, hasAny } = checkIngredientInPantry(ing.name, pantry);
    
    let status: 'ok' | 'low' | 'missing' = 'missing';
    let currentQty = 0;

    if (pantryItem) {
      currentQty = pantryItem.quantity;
      if (pantryItem.quantity <= 0) {
        status = 'missing';
      } else if (pantryItem.quantity <= pantryItem.minQuantity) {
        status = 'low';
      } else {
        status = 'ok';
      }
    }

    return {
      name: ing.name,
      amount: scaledAmount,
      unit: ing.unit,
      status,
      currentQty,
      pantryItem
    };
  });

  const missingIngredients = ingredientStatuses.filter(i => i.status === 'missing' || i.status === 'low');

  const handleAddAllMissing = () => {
    missingIngredients.forEach(ing => {
      onAddToShoppingList({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        category: ing.pantryItem?.category || 'Mercearia',
        recipeTitle: recipe.title
      });
    });
    alert(`Adicionado ${missingIngredients.length} item(ns) à lista de compras!`);
  };

  const handleAddSingle = (ing: typeof ingredientStatuses[0]) => {
    onAddToShoppingList({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.pantryItem?.category || 'Mercearia',
      recipeTitle: recipe.title
    });
  };

  return (
    <div id="recipe-detail-view" className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-4xl mx-auto">
      {/* Banner Image with Overlay */}
      <div className="relative h-80 sm:h-96 w-full bg-slate-100">
        <img
          src={recipe.image}
          alt={recipe.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
        
        {/* Navigation & Favorite Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
          
          <button
            onClick={onToggleFavorite}
            className="bg-white/90 hover:bg-white text-rose-500 p-2.5 rounded-full shadow-lg transition-all"
            title="Salvar nos Favoritos"
          >
            <Heart size={20} fill={isFavorite ? '#f43f5e' : 'none'} className="transition-colors" />
          </button>
        </div>

        {/* Floating recipe metadata tags */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-orange-500/90 text-white shadow">
              {recipe.difficulty}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-emerald-600/90 text-white shadow">
              {recipe.diet}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-sky-600/90 text-white shadow">
              {recipe.category}
            </span>
            {recipe.isChefAI && (
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-purple-600/90 text-white shadow animate-pulse">
                ✦ Chef IA
              </span>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-serif italic font-bold tracking-tight mb-2 text-white">
            {recipe.title}
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-light max-w-2xl line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Main Content Info Bar */}
      <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50 p-4 text-center">
        <div className="flex flex-col items-center justify-center border-r border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600 mb-0.5">
            <Clock size={16} className="text-orange-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Tempo</span>
          </div>
          <span className="text-sm font-semibold text-slate-800 font-display">{recipe.prepTime} min</span>
        </div>

        <div className="flex flex-col items-center justify-center border-r border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600 mb-0.5">
            <Users size={16} className="text-sky-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Rendimento</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold transition-all"
            >
              -
            </button>
            <span className="text-sm font-semibold text-slate-800 font-display">{servings} porções</span>
            <button
              onClick={() => setServings(servings + 1)}
              className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 text-slate-600 mb-0.5">
            <Flame size={16} className="text-rose-500" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Calorias</span>
          </div>
          <span className="text-sm font-semibold text-slate-800 font-display">
            {recipe.calories ? `${Math.round(recipe.calories * scaleFactor)} kcal` : '-- kcal'}
          </span>
        </div>
      </div>

      {/* Chef Actions & AI Adaptation Panel */}
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Active cooking triggers */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => onStartCooking(recipe, servings)}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer grow sm:grow-0"
          >
            <Play size={14} fill="currentColor" />
            <span>Iniciar Modo Cozinhar Ativo ⏱️</span>
          </button>
        </div>

        {/* AI Diet Adaptations Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <Sparkles size={13} className="text-purple-500 shrink-0" />
            <span>Adaptar para:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDietGoal}
              onChange={e => setSelectedDietGoal(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Vegana">Vegana (Sem animal)</option>
              <option value="Sem Glúten">Sem Glúten</option>
              <option value="Sem Lactose">Sem Lactose</option>
              <option value="Low Carb">Low Carb / Fit</option>
              <option value="Vegetariana">Vegetariana</option>
            </select>

            <button
              onClick={handleAdaptRecipe}
              disabled={isAdapting}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0 disabled:cursor-not-allowed"
            >
              {isAdapting ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <ChefHat size={13} />
              )}
              <span>{isAdapting ? 'Adaptando...' : 'Reescrever ✦'}</span>
            </button>
          </div>
        </div>

        {/* Custom recipe management delete & edit buttons */}
        {isCustomRecipe && (
          <div className="flex gap-2 w-full md:w-auto shrink-0">
            {onEditRecipe && (
              <button
                onClick={() => onEditRecipe(recipe)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1.5 grow md:grow-0 cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Editar</span>
              </button>
            )}

            {onDeleteRecipe && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir permanentemente esta receita personalizada?')) {
                    onDeleteRecipe(recipe.id);
                  }
                }}
                className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1.5 grow md:grow-0 border border-rose-100/60 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Excluir</span>
              </button>
            )}
          </div>
        )}
      </div>

      {adaptationError && (
        <div className="p-4 mx-6 mt-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex justify-between items-center animate-fade-in">
          <span>{adaptationError}</span>
          <button onClick={() => setAdaptationError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer p-1">
            <X size={14} className="hidden" /> {/* fallback */}
            <span>Ok</span>
          </button>
        </div>
      )}

      {/* Ingredients & Instructions Grid */}
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Column: Ingredients Stock Status (40%) */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif italic font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag size={18} className="text-slate-600" />
              Ingredientes
            </h3>
            
            {missingIngredients.length > 0 && (
              <button
                onClick={handleAddAllMissing}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-all"
              >
                <Plus size={12} />
                <span>Comprar Faltantes</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {ingredientStatuses.map((ing, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  ing.status === 'ok'
                    ? 'bg-emerald-50/40 border-emerald-100/70 text-slate-800'
                    : ing.status === 'low'
                    ? 'bg-amber-50/40 border-amber-100 text-slate-800'
                    : 'bg-rose-50/40 border-rose-100 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    {ing.status === 'ok' && <Check size={14} className="text-emerald-600 shrink-0" />}
                    {ing.status === 'low' && <AlertCircle size={14} className="text-amber-600 shrink-0" />}
                    {ing.status === 'missing' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>}
                    <span className={ing.status === 'missing' ? 'line-through decoration-slate-300 text-slate-500' : ''}>
                      {ing.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ing.amount} {ing.unit}
                    {ing.pantryItem && (
                      <span className="ml-1 text-[10px] font-medium px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                        Dispensa: {ing.currentQty} {ing.pantryItem.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add to Shopping List controls */}
                {ing.status !== 'ok' && (
                  <button
                    onClick={() => {
                      handleAddSingle(ing);
                      alert(`"${ing.name}" adicionado à lista de compras!`);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      ing.status === 'low'
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-100'
                        : 'border-rose-200 text-rose-700 hover:bg-rose-100'
                    }`}
                    title="Adicionar à Lista de Compras"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick static substitutions tip card */}
          <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold uppercase tracking-wider">
              <span>💡 Dica de Substituições Inteligentes</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed font-medium">
              <li>• <strong className="text-slate-700">Sem Glúten:</strong> Troque trigo por farinha de arroz, aveia ou amêndoas.</li>
              <li>• <strong className="text-slate-700">Sem Lactose:</strong> Use leite de coco, aveia ou amêndoas, e manteiga ghee ou óleo de coco.</li>
              <li>• <strong className="text-slate-700">Vegano (Sem Ovo):</strong> Use 1 col. de sopa de semente de linhaça hidratada em 3 col. de água.</li>
              <li>• <strong className="text-slate-700">Sem Açúcar:</strong> Substitua por mel, açúcar de coco ou adoçante Stevia.</li>
              <li>• <strong className="text-slate-700">Proteína:</strong> Substitua carnes por cogumelos, lentilha, tofu ou grão-de-bico.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Cooking steps (60%) */}
        <div className="md:col-span-3 space-y-6">
          <h3 className="text-lg font-serif italic font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-slate-600" />
            Modo de Preparo
          </h3>

          <div className="space-y-4">
            {recipeAtSteps(recipe.instructions).map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50/50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex-shrink-0 font-serif font-bold italic text-lg text-orange-600 w-8">
                  {String(idx + 1).padStart(2, '0')}.
                </div>
                <p className="text-slate-700 text-sm leading-relaxed pt-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Small defensive utility to support parsing bullet string blocks or standard array lists
function recipeAtSteps(instructions: any): string[] {
  if (Array.isArray(instructions)) {
    return instructions;
  }
  if (typeof instructions === 'string') {
    return (instructions as string)
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  return [];
}
