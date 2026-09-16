import React, { useState } from 'react';
import { WeeklyPlan, Recipe, DayOfWeek, MealTime, ShoppingListItem } from '../types';
import { Calendar, Trash2, Plus, ArrowRight, ClipboardList, CheckCircle, ChefHat } from 'lucide-react';

interface WeeklyPlannerProps {
  weeklyPlan: WeeklyPlan[];
  recipes: Recipe[];
  onUpdatePlan: (updated: WeeklyPlan[]) => void;
  onAddShoppingListItem: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

const DAYS: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const MEALS: MealTime[] = ['Café da Manhã', 'Almoço', 'Jantar'];

export default function WeeklyPlanner({
  weeklyPlan,
  recipes,
  onUpdatePlan,
  onAddShoppingListItem,
  onSelectRecipe
}: WeeklyPlannerProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Segunda');
  const [selectedMeal, setSelectedMeal] = useState<MealTime>('Almoço');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');

  // Handle scheduling a recipe
  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    // Remove any existing recipe for the same day and meal slot to avoid duplicates
    const filtered = weeklyPlan.filter(
      item => !(item.day === selectedDay && item.meal === selectedMeal)
    );

    const newPlanItem: WeeklyPlan = {
      id: `plan-${Date.now()}`,
      day: selectedDay,
      meal: selectedMeal,
      recipeId: selectedRecipeId
    };

    onUpdatePlan([...filtered, newPlanItem]);
    setSelectedRecipeId('');
    alert(`Refeição agendada com sucesso para ${selectedDay} no ${selectedMeal}!`);
  };

  // Clear single plan item
  const handleRemovePlanItem = (id: string) => {
    onUpdatePlan(weeklyPlan.filter(item => item.id !== id));
  };

  // Clear entire week's plan
  const handleClearAll = () => {
    if (confirm('Deseja limpar todo o planejamento semanal de refeições?')) {
      onUpdatePlan([]);
    }
  };

  // Generate shopping list items from the whole weekly plan
  const handleGenerateShoppingFromPlan = () => {
    if (weeklyPlan.length === 0) {
      alert('Seu planejamento semanal está vazio. Adicione receitas antes de gerar a lista.');
      return;
    }

    let addedCount = 0;
    weeklyPlan.forEach(planItem => {
      const recipe = recipes.find(r => r.id === planItem.recipeId);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          onAddShoppingListItem({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            category: 'Mercearia', // Fallback
            recipeTitle: `Menu Semanal: ${recipe.title}`
          });
          addedCount++;
        });
      }
    });

    alert(`Sucesso! Adicionado os ingredientes de todas as receitas planejadas à lista de compras.`);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-xl font-serif italic font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={22} className="text-orange-500" />
            <span>Cronograma Semanal da Família</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Organize os pratos de toda a semana para evitar desperdício de alimentos e planejar as compras com antecedência.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={handleGenerateShoppingFromPlan}
            disabled={weeklyPlan.length === 0}
            className="flex-1 md:flex-initial text-xs bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-medium py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow shadow-orange-500/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <ClipboardList size={14} />
            <span>Abastecer Lista com Menu</span>
          </button>
          
          <button
            onClick={handleClearAll}
            disabled={weeklyPlan.length === 0}
            className="flex-1 md:flex-initial text-xs bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-medium py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>Limpar Cronograma</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Scheduler Form panel (1/4 space) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 h-fit">
          <h4 className="text-md font-display font-semibold text-slate-800 flex items-center gap-1.5">
            <ChefHat size={18} className="text-orange-500" />
            Agendar Refeição
          </h4>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Dia da Semana</label>
              <select
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Momento da Refeição</label>
              <select
                value={selectedMeal}
                onChange={e => setSelectedMeal(e.target.value as MealTime)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              >
                {MEALS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Escolher Receita</label>
              <select
                required
                value={selectedRecipeId}
                onChange={e => setSelectedRecipeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 font-medium"
              >
                <option value="">Selecione uma receita...</option>
                {recipes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.diet})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedRecipeId}
              className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-slate-100 text-white disabled:text-slate-400 font-medium py-2 px-4 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Agendar no Cardápio</span>
            </button>
          </form>
        </div>

        {/* Weekly Calendar Schedule Board (3/4 space) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="grid grid-cols-8 border-b border-slate-100 pb-3 mb-4 text-center">
              <div className="text-left font-display font-semibold text-slate-400 text-xs uppercase tracking-wider">
                Refeição
              </div>
              {DAYS.map(day => (
                <div key={day} className="font-display font-semibold text-slate-700 text-xs uppercase tracking-wider">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Meal rows */}
            <div className="space-y-4">
              {MEALS.map(meal => (
                <div key={meal} className="grid grid-cols-8 items-center gap-2">
                  {/* Left row header */}
                  <div className="text-left py-2 font-display font-semibold text-slate-800 text-xs sm:text-sm">
                    {meal}
                  </div>

                  {/* Day boxes */}
                  {DAYS.map(day => {
                    const scheduled = weeklyPlan.find(item => item.day === day && item.meal === meal);
                    const recipe = scheduled ? recipes.find(r => r.id === scheduled.recipeId) : null;

                    return (
                      <div
                        key={day}
                        className={`h-24 rounded-xl p-2.5 border transition-all flex flex-col justify-between ${
                          recipe
                            ? 'bg-orange-50/40 border-orange-200/60 shadow-xs'
                            : 'bg-slate-50/50 border-slate-100 border-dashed hover:bg-slate-50/80 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!recipe) {
                            setSelectedDay(day);
                            setSelectedMeal(meal);
                          }
                        }}
                      >
                        {recipe ? (
                          <>
                            <div className="space-y-1">
                              <h5
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectRecipe(recipe);
                                }}
                                className="font-semibold text-[11px] text-slate-800 leading-tight hover:text-orange-600 hover:underline cursor-pointer line-clamp-2"
                                title={recipe.title}
                              >
                                {recipe.title}
                              </h5>
                              <span className="text-[9px] uppercase tracking-wider text-orange-600 font-bold block">
                                {recipe.diet}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePlanItem(scheduled!.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-all self-end"
                              title="Remover refeição"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-300 group hover:text-orange-400">
                            <Plus size={16} className="stroke-1.5 transition-colors" />
                            <span className="text-[9px] font-medium mt-1">Adicionar</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
