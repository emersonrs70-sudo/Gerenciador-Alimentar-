import React, { useState } from 'react';
import { Recipe, PantryItem, ShoppingListItem } from '../types';
import { Clock, Users, Flame, Heart, ArrowLeft, Check, Plus, AlertCircle, ShoppingBag } from 'lucide-react';
import { checkIngredientInPantry } from '../utils';

interface RecipeDetailProps {
  recipe: Recipe;
  pantry: PantryItem[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToShoppingList: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void;
  onClose: () => void;
}

export default function RecipeDetail({
  recipe,
  pantry,
  isFavorite,
  onToggleFavorite,
  onAddToShoppingList,
  onClose
}: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings || 4);
  const scaleFactor = servings / (recipe.servings || 4);

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
    <div id="recipe-detail-view" class="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-4xl mx-auto">
      {/* Banner Image with Overlay */}
      <div class="relative h-80 sm:h-96 w-full bg-slate-100">
        <img
          src={recipe.image}
          alt={recipe.title}
          referrerPolicy="no-referrer"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
        
        {/* Navigation & Favorite Controls */}
        <div class="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onClose}
            class="bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
          
          <button
            onClick={onToggleFavorite}
            class="bg-white/90 hover:bg-white text-rose-500 p-2.5 rounded-full shadow-lg transition-all"
            title="Salvar nos Favoritos"
          >
            <Heart size={20} fill={isFavorite ? '#f43f5e' : 'none'} class="transition-colors" />
          </button>
        </div>

        {/* Floating recipe metadata tags */}
        <div class="absolute bottom-6 left-6 right-6 text-white">
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-orange-500/90 text-white shadow">
              {recipe.difficulty}
            </span>
            <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-emerald-600/90 text-white shadow">
              {recipe.diet}
            </span>
            <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-sky-600/90 text-white shadow">
              {recipe.category}
            </span>
            {recipe.isChefAI && (
              <span class="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-purple-600/90 text-white shadow animate-pulse">
                ✦ Chef IA
              </span>
            )}
          </div>
          
          <h1 class="text-2xl sm:text-4xl font-serif italic font-bold tracking-tight mb-2 text-white">
            {recipe.title}
          </h1>
          <p class="text-slate-200 text-sm sm:text-base font-light max-w-2xl line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </div>

      {/* Main Content Info Bar */}
      <div class="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50 p-4 text-center">
        <div class="flex flex-col items-center justify-center border-r border-slate-100">
          <div class="flex items-center gap-1.5 text-slate-600 mb-0.5">
            <Clock size={16} class="text-orange-500" />
            <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Tempo</span>
          </div>
          <span class="text-sm font-semibold text-slate-800 font-display">{recipe.prepTime} min</span>
        </div>

        <div class="flex flex-col items-center justify-center border-r border-slate-100">
          <div class="flex items-center gap-1.5 text-slate-600 mb-0.5">
            <Users size={16} class="text-sky-500" />
            <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Rendimento</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              class="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold transition-all"
            >
              -
            </button>
            <span class="text-sm font-semibold text-slate-800 font-display">{servings} porções</span>
            <button
              onClick={() => setServings(servings + 1)}
              class="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center">
          <div class="flex items-center gap-1.5 text-slate-600 mb-0.5">
            <Flame size={16} class="text-rose-500" />
            <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Calorias</span>
          </div>
          <span class="text-sm font-semibold text-slate-800 font-display">
            {recipe.calories ? `${Math.round(recipe.calories * scaleFactor)} kcal` : '-- kcal'}
          </span>
        </div>
      </div>

      {/* Ingredients & Instructions Grid */}
      <div class="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Column: Ingredients Stock Status (40%) */}
        <div class="md:col-span-2 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-serif italic font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag size={18} class="text-slate-600" />
              Ingredientes
            </h3>
            
            {missingIngredients.length > 0 && (
              <button
                onClick={handleAddAllMissing}
                class="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-all"
              >
                <Plus size={12} />
                <span>Comprar Faltantes</span>
              </button>
            )}
          </div>

          <div class="space-y-2.5">
            {ingredientStatuses.map((ing, idx) => (
              <div
                key={idx}
                class={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  ing.status === 'ok'
                    ? 'bg-emerald-50/40 border-emerald-100/70 text-slate-800'
                    : ing.status === 'low'
                    ? 'bg-amber-50/40 border-amber-100 text-slate-800'
                    : 'bg-rose-50/40 border-rose-100 text-slate-700'
                }`}
              >
                <div>
                  <div class="font-medium text-sm flex items-center gap-1.5">
                    {ing.status === 'ok' && <Check size={14} class="text-emerald-600 shrink-0" />}
                    {ing.status === 'low' && <AlertCircle size={14} class="text-amber-600 shrink-0" />}
                    {ing.status === 'missing' && <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>}
                    <span class={ing.status === 'missing' ? 'line-through decoration-slate-300 text-slate-500' : ''}>
                      {ing.name}
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">
                    {ing.amount} {ing.unit}
                    {ing.pantryItem && (
                      <span class="ml-1 text-[10px] font-medium px-1 py-0.5 rounded bg-slate-100 text-slate-600">
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
                    class={`p-1.5 rounded-lg border transition-all ${
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
        </div>

        {/* Right Column: Cooking steps (60%) */}
        <div class="md:col-span-3 space-y-6">
          <h3 class="text-lg font-serif italic font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} class="text-slate-600" />
            Modo de Preparo
          </h3>

          <div class="space-y-4">
            {recipeAtSteps(recipe.instructions).map((step, idx) => (
              <div key={idx} class="flex gap-4 p-4 rounded-2xl hover:bg-slate-50/50 transition-all border border-transparent hover:border-slate-100">
                <div class="flex-shrink-0 font-serif font-bold italic text-lg text-orange-600 w-8">
                  {String(idx + 1).padStart(2, '0')}.
                </div>
                <p class="text-slate-700 text-sm leading-relaxed pt-1">
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
