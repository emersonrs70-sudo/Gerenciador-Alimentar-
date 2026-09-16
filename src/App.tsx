import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, PantryItem, WeeklyPlan, ShoppingListItem, RecipeDiet, RecipeDifficulty, RecipeCategory, CookingHistoryEntry } from './types';
import { INITIAL_RECIPES, INITIAL_PANTRY } from './data';
import { getRecipeMatchScore } from './utils';

// Modular Components
import RecipeDetail from './components/RecipeDetail';
import PantryManager from './components/PantryManager';
import WeeklyPlanner from './components/WeeklyPlanner';
import ShoppingListManager from './components/ShoppingListManager';
import ChefAIPanel from './components/ChefAIPanel';
import ActiveCookingWalkthrough from './components/ActiveCookingWalkthrough';
import ManualRecipeForm from './components/ManualRecipeForm';
import CookingHistoryDashboard from './components/CookingHistoryDashboard';

// Icons
import {
  Search,
  Filter,
  Heart,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  ChefHat,
  Clock,
  X,
  Plus,
  BookOpen,
  Utensils,
  Maximize2,
  Award,
  History,
  TrendingUp,
  ClipboardList,
  Edit3
} from 'lucide-react';

export default function App() {
  // Navigation space tab
  const [activeTab, setActiveTab] = useState<'recipes' | 'pantry' | 'planning' | 'shopping' | 'chef-ai' | 'history'>('recipes');

  // Core App states with LocalStorage persistence
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('receitas_items');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem('receitas_pantry');
    return saved ? JSON.parse(saved) : INITIAL_PANTRY;
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>(() => {
    const saved = localStorage.getItem('receitas_plan');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    const saved = localStorage.getItem('receitas_shopping');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('receitas_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Cooking History State
  const [cookingHistory, setCookingHistory] = useState<CookingHistoryEntry[]>(() => {
    const saved = localStorage.getItem('receitas_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Active cooking step-by-step state
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [cookingServings, setCookingServings] = useState<number>(4);

  // Manual Custom Recipe modal state
  const [showManualRecipeForm, setShowManualRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>(undefined);

  // Selected recipe for detail modal / view
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Search & filter states for recipe library
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<RecipeDiet | 'Todos'>('Todos');
  const [difficultyFilter, setDifficultyFilter] = useState<RecipeDifficulty | 'Todos'>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<RecipeCategory | 'Todos'>('Todos');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // States for searching and generating new recipes via Gemini AI
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [searchAIError, setSearchAIError] = useState<string | null>(null);

  // Persist states to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('receitas_items', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('receitas_pantry', JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    localStorage.setItem('receitas_plan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem('receitas_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('receitas_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('receitas_history', JSON.stringify(cookingHistory));
  }, [cookingHistory]);

  // Toggle favorite recipe state
  const handleToggleFavorite = (recipeId: string) => {
    setFavorites(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };

  // Add item directly to shopping list
  const handleAddShoppingListItem = (item: Omit<ShoppingListItem, 'id' | 'checked'>) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      checked: false
    };
    setShoppingList(prev => [...prev, newItem]);
  };

  // Handle active step-by-step cooking completion with stock deduction & stats tracking
  const handleFinishCooking = (deductPantry: boolean) => {
    if (!activeCookingRecipe) return;

    const recipe = activeCookingRecipe;
    const servings = cookingServings;
    const factor = servings / (recipe.servings || 4);
    const lowStockAlertItems: string[] = [];

    if (deductPantry) {
      setPantry(currentPantry => {
        const updatedPantry = currentPantry.map(item => {
          // Find if this pantry item matches an ingredient required in the recipe
          const matchingIngredient = recipe.ingredients.find(ing => 
            ing.name.toLowerCase().trim() === item.name.toLowerCase().trim() ||
            item.name.toLowerCase().trim().includes(ing.name.toLowerCase().trim()) ||
            ing.name.toLowerCase().trim().includes(item.name.toLowerCase().trim())
          );

          if (matchingIngredient) {
            const requiredQty = matchingIngredient.amount * factor;
            const newQty = Math.max(0, Math.round((item.quantity - requiredQty) * 10) / 10);
            
            if (newQty <= item.minQuantity && item.quantity > item.minQuantity) {
              lowStockAlertItems.push(item.name);
            }
            return { ...item, quantity: newQty };
          }
          return item;
        });
        return updatedPantry;
      });
    }

    // Add to cooking history
    const newHistoryEntry: CookingHistoryEntry = {
      id: `cooked-${Date.now()}`,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
      cookedAt: new Date().toISOString(),
      servings,
      calories: recipe.calories || 240,
      difficulty: recipe.difficulty,
      diet: recipe.diet
    };

    setCookingHistory(prev => [newHistoryEntry, ...prev]);
    setActiveCookingRecipe(null);
    setSelectedRecipe(null);

    // Show a helpful stock deduction summary alert
    setTimeout(() => {
      if (lowStockAlertItems.length > 0) {
        const confirmAdd = window.confirm(
          `🍳 Receita concluída com sucesso e salva no Histórico!\n\nAtenção: os seguintes itens da sua despensa ficaram com estoque baixo ou esgotaram: ${lowStockAlertItems.join(', ')}.\n\nDeseja adicioná-los automaticamente à sua lista de compras?`
        );
        if (confirmAdd) {
          lowStockAlertItems.forEach(name => {
            const pantryItem = pantry.find(p => p.name.toLowerCase() === name.toLowerCase());
            handleAddShoppingListItem({
              name,
              amount: pantryItem ? pantryItem.minQuantity * 2 : 1,
              unit: pantryItem ? pantryItem.unit : 'unidade',
              category: pantryItem ? pantryItem.category : 'Despensa',
              recipeTitle: recipe.title
            });
          });
          alert('Itens adicionados à lista de compras!');
        }
      } else {
        alert('🎉 Parabéns! Receita concluída e salva no histórico com sucesso!');
      }
    }, 400);
  };

  // Add / Edit manual custom recipe
  const handleSaveManualRecipe = (savedRecipe: Recipe) => {
    setRecipes(prev => {
      const exists = prev.some(r => r.id === savedRecipe.id);
      if (exists) {
        return prev.map(r => r.id === savedRecipe.id ? savedRecipe : r);
      } else {
        return [savedRecipe, ...prev];
      }
    });
    setShowManualRecipeForm(false);
    setEditingRecipe(undefined);
    if (selectedRecipe && selectedRecipe.id === savedRecipe.id) {
      setSelectedRecipe(savedRecipe);
    }
  };

  // Permanent custom recipe deleting
  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    setFavorites(prev => prev.filter(id => id !== recipeId));
    setSelectedRecipe(null);
  };

  // AI adaptation recipe receiver
  const handleRecipeAdapted = (adaptedRecipe: Recipe) => {
    setRecipes(prev => [adaptedRecipe, ...prev]);
    setSelectedRecipe(adaptedRecipe);
  };

  // Handle recipe generated by Chef AI
  const handleRecipeGenerated = (newRecipe: Recipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
    setSelectedRecipe(newRecipe);
    setActiveTab('recipes'); // switch back to library to view it
  };

  // Call API to search and generate a recipe by name/query
  const handleAISearchGenerate = async (queryText: string) => {
    if (!queryText || queryText.trim().length === 0) return;
    setIsSearchingAI(true);
    setSearchAIError(null);
    try {
      const response = await fetch('/api/search-new-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao gerar receita via IA.');
      }
      const newRecipe: Recipe = await response.json();
      setRecipes(prev => [newRecipe, ...prev]);
      setSelectedRecipe(newRecipe);
      setSearchQuery(''); // clear search query on success
    } catch (error: any) {
      console.error(error);
      setSearchAIError(error.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Filter recipes based on query, diet, difficulty, category, and favorites toggles
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search matches title or ingredients
      const matchesSearch = 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDiet = dietFilter === 'Todos' || recipe.diet === dietFilter;
      const matchesDifficulty = difficultyFilter === 'Todos' || recipe.difficulty === difficultyFilter;
      const matchesCategory = categoryFilter === 'Todos' || recipe.category === categoryFilter;
      const matchesFavorite = !showOnlyFavorites || favorites.includes(recipe.id);

      return matchesSearch && matchesDiet && matchesDifficulty && matchesCategory && matchesFavorite;
    });
  }, [recipes, searchQuery, dietFilter, difficultyFilter, categoryFilter, showOnlyFavorites, favorites]);

  // Calculate missing stock info for filtered recipes to showcase live inventory matches
  const recipesWithStockInfo = useMemo(() => {
    return filteredRecipes.map(recipe => {
      const match = getRecipeMatchScore(recipe, pantry);
      return {
        recipe,
        percentage: match.percentage,
        available: match.availableCount,
        total: match.totalCount
      };
    });
  }, [filteredRecipes, pantry]);

  // Count items running out in pantry for header badge alerts
  const lowStockPantryCount = useMemo(() => {
    return pantry.filter(item => item.quantity <= item.minQuantity).length;
  }, [pantry]);

  // Count active unchecked shopping list items
  const activeShoppingCount = useMemo(() => {
    return shoppingList.filter(item => !item.checked).length;
  }, [shoppingList]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Visual Elegant Header with Navigation spaces */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Elegant brand typography and humble description */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setSelectedRecipe(null); setActiveTab('recipes'); }}>
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <ChefHat size={20} className="stroke-2" />
              </div>
              <div>
                <h1 className="text-2xl font-serif italic font-bold tracking-tight text-slate-800 leading-none">
                  Cozinha Inteligente
                </h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1.5 block">
                  Receitas & Planejamento
                </span>
              </div>
            </div>

            {/* Desktop Navigation Spaces */}
            <nav className="hidden lg:flex gap-8 text-xs font-semibold uppercase tracking-widest">
              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('recipes'); }}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'recipes'
                    ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <span>Receitas</span>
              </button>

              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('pantry'); }}
                className={`pb-1 transition-all relative cursor-pointer ${
                  activeTab === 'pantry'
                    ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <span>Despensa</span>
                {lowStockPantryCount > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {lowStockPantryCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('planning'); }}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'planning'
                    ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <span>Planejamento</span>
              </button>

              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('shopping'); }}
                className={`pb-1 transition-all relative cursor-pointer ${
                  activeTab === 'shopping'
                    ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <span>Lista de Compras</span>
                {activeShoppingCount > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {activeShoppingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('history'); }}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <span>Histórico</span>
              </button>

              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('chef-ai'); }}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'chef-ai'
                    ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                    : 'text-orange-500/70 hover:text-orange-500'
                }`}
              >
                <span>Chef IA ✦</span>
              </button>
            </nav>

            {/* Basic Mobile layout indicators */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('history'); }}
                className={`p-2 rounded-xl transition-all ${
                  activeTab === 'history' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'
                }`}
                title="Histórico"
              >
                <History size={18} />
              </button>
              <button
                onClick={() => { setSelectedRecipe(null); setActiveTab('chef-ai'); }}
                className={`p-2 rounded-xl transition-all ${
                  activeTab === 'chef-ai' ? 'bg-purple-50 text-purple-600' : 'text-purple-600'
                }`}
                title="Chef IA"
              >
                <Sparkles size={18} className="text-yellow-500 fill-yellow-400" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main layout container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Render a single recipe detailed view if selected */}
        {selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            pantry={pantry}
            isFavorite={favorites.includes(selectedRecipe.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedRecipe.id)}
            onAddToShoppingList={handleAddShoppingListItem}
            onClose={() => setSelectedRecipe(null)}
            onStartCooking={(recipe, servings) => {
              setActiveCookingRecipe(recipe);
              setCookingServings(servings);
            }}
            onRecipeAdapted={handleRecipeAdapted}
            onDeleteRecipe={handleDeleteRecipe}
            onEditRecipe={(recipe) => {
              setEditingRecipe(recipe);
              setShowManualRecipeForm(true);
            }}
          />
        ) : (
          <>
            {/* 1. Recipe Catalog Space */}
            {activeTab === 'recipes' && (
              <div className="space-y-6">
                
                {/* Advanced Search & Filtering Controls */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  
                  {/* Text search */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por nome de receita ou ingrediente (Ex: salmão, aveia...)"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Search query suggestion / AI generation prompt */}
                  {searchQuery.trim().length >= 2 && !isSearchingAI && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-orange-50/50 rounded-xl border border-orange-100/60 gap-3 animate-fade-in">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Sparkles size={14} className="text-orange-500 shrink-0" />
                        <span>Quer uma receita nova e específica para <strong>"{searchQuery}"</strong>?</span>
                      </div>
                      <button
                        onClick={() => handleAISearchGenerate(searchQuery)}
                        className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-orange-500/10 cursor-pointer self-start sm:self-center shrink-0"
                      >
                        <ChefHat size={13} />
                        <span>Gerar com Chef IA ✦</span>
                      </button>
                    </div>
                  )}

                  {/* AI Search Errors */}
                  {searchAIError && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs flex justify-between items-center animate-fade-in">
                      <span>{searchAIError}</span>
                      <button onClick={() => setSearchAIError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer p-1">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Filter chips container */}
                  <div className="flex flex-wrap gap-4 items-center justify-between pt-1">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      
                      {/* Diet filter */}
                      <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider px-2">Dieta</span>
                        {['Todos', 'Fit', 'Fim de Semana', 'Calórica'].map(d => (
                          <button
                            key={d}
                            onClick={() => setDietFilter(d as any)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              dietFilter === d
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>

                      {/* Difficulty filter */}
                      <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider px-2">Complexidade</span>
                        {['Todos', 'Fácil', 'Médio', 'Difícil'].map(dif => (
                          <button
                            key={dif}
                            onClick={() => setDifficultyFilter(dif as any)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              difficultyFilter === dif
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {dif}
                          </button>
                        ))}
                      </div>

                      {/* Meal occasions filter */}
                      <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider px-2">Ocasião</span>
                        {['Todos', 'Dia a Dia', 'Domingo'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat as any)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              categoryFilter === cat
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingRecipe(undefined);
                          setShowManualRecipeForm(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center gap-1.5 shadow-sm shadow-orange-500/10 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Nova Receita</span>
                      </button>

                      <button
                        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          showOnlyFavorites
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Heart size={14} fill={showOnlyFavorites ? '#e11d48' : 'none'} className={showOnlyFavorites ? 'text-rose-600' : 'text-slate-400'} />
                        <span>Favoritos</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Recipe grid list with stock percentages */}
                {isSearchingAI ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center max-w-xl mx-auto space-y-6 animate-fade-in my-8">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-orange-100 animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-orange-500">
                        <Sparkles size={28} className="animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-serif italic font-bold text-slate-800 text-xl">
                        O Chef IA está criando sua nova receita...
                      </h4>
                      <p className="text-sm text-slate-400 font-light max-w-sm mx-auto">
                        Buscando os melhores ingredientes, definindo tempos exatos de cozimento e estruturando o passo a passo para "{searchQuery || 'seu prato desejado'}".
                      </p>
                    </div>
                  </div>
                ) : recipesWithStockInfo.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 max-w-2xl mx-auto p-8 space-y-6 my-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Search size={20} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-slate-700 font-serif italic font-bold text-lg">
                        Nenhuma receita encontrada localmente para "{searchQuery || 'os filtros selecionados'}".
                      </p>
                      {searchQuery ? (
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                          Mas não se preocupe! O Chef IA pode criar uma receita incrível e sob medida de "{searchQuery}" para você agora mesmo.
                        </p>
                      ) : (
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                          Tente redefinir os filtros de busca para ver todas as receitas disponíveis.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      {searchQuery && (
                        <button
                          onClick={() => handleAISearchGenerate(searchQuery)}
                          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                        >
                          <Sparkles size={16} />
                          <span>Criar Receita de "{searchQuery}" com IA ✦</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setDietFilter('Todos');
                          setDifficultyFilter('Todos');
                          setCategoryFilter('Todos');
                          setShowOnlyFavorites(false);
                        }}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                      >
                        Limpar filtros de busca
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipesWithStockInfo.map(({ recipe, percentage, available, total }) => {
                      const isFav = favorites.includes(recipe.id);

                      return (
                        <div
                          key={recipe.id}
                          className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                        >
                          {/* Recipe image banner */}
                          <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={recipe.image}
                              alt={recipe.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => setSelectedRecipe(recipe)}
                            />
                            
                            {/* Tags overlays */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                              <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md bg-white/95 text-slate-800 shadow">
                                {recipe.diet}
                              </span>
                              <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md bg-orange-500 text-white shadow">
                                {recipe.difficulty}
                              </span>
                            </div>

                            {/* Favorites toggler */}
                            <button
                              onClick={() => handleToggleFavorite(recipe.id)}
                              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-rose-500 shadow transition-all"
                            >
                              <Heart size={14} fill={isFav ? '#f43f5e' : 'none'} />
                            </button>

                            {/* Chef AI label */}
                            {recipe.isChefAI && (
                              <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md bg-purple-600 text-white shadow-md">
                                ✦ Chef IA
                              </span>
                            )}
                          </div>

                          {/* Info area */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1.5">
                              <h3
                                onClick={() => setSelectedRecipe(recipe)}
                                className="font-serif italic font-bold text-slate-800 text-lg leading-snug hover:text-orange-500 cursor-pointer line-clamp-1"
                              >
                                {recipe.title}
                              </h3>
                              <p className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed">
                                {recipe.description}
                              </p>
                            </div>

                            {/* Stock match indicator footer */}
                            <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-medium">Ingredientes em estoque</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        percentage === 100
                                          ? 'bg-emerald-500'
                                          : percentage >= 50
                                          ? 'bg-amber-500'
                                          : 'bg-rose-400'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-slate-600">
                                    {available}/{total}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedRecipe(recipe)}
                                className="text-xs text-slate-900 hover:text-orange-500 font-semibold flex items-center gap-0.5"
                              >
                                <span>Preparar</span>
                                <Maximize2 size={10} />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. Pantry Space */}
            {activeTab === 'pantry' && (
              <PantryManager
                pantry={pantry}
                recipes={recipes}
                onUpdatePantry={setPantry}
                onAddShoppingListItem={handleAddShoppingListItem}
                onSelectRecipe={setSelectedRecipe}
              />
            )}

            {/* 3. Family Planning space */}
            {activeTab === 'planning' && (
              <WeeklyPlanner
                weeklyPlan={weeklyPlan}
                recipes={recipes}
                onUpdatePlan={setWeeklyPlan}
                onAddShoppingListItem={handleAddShoppingListItem}
                onSelectRecipe={setSelectedRecipe}
              />
            )}

            {/* 4. Smart Shopping List space */}
            {activeTab === 'shopping' && (
              <ShoppingListManager
                shoppingList={shoppingList}
                onUpdateList={setShoppingList}
              />
            )}

            {/* 5. Chef AI Generation space */}
            {activeTab === 'chef-ai' && (
              <ChefAIPanel
                pantry={pantry}
                onRecipeGenerated={handleRecipeGenerated}
              />
            )}

            {/* 6. Cooking History & Nutritional Dashboard space */}
            {activeTab === 'history' && (
              <CookingHistoryDashboard
                history={cookingHistory}
                onClearHistory={() => setCookingHistory([])}
                onRemoveEntry={(id) => setCookingHistory(prev => prev.filter(e => e.id !== id))}
              />
            )}
          </>
        )}

      </main>

      {/* Footer component */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Cozinha Inteligente. Planejamento familiar com amor e inteligência artificial.</p>
        </div>
      </footer>

      {/* Tab bar for mobile screens (fixed to bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2 px-3 flex justify-around items-center z-40 shadow-xl">
        <button
          onClick={() => { setSelectedRecipe(null); setActiveTab('recipes'); }}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'recipes' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-medium">Receitas</span>
        </button>

        <button
          onClick={() => { setSelectedRecipe(null); setActiveTab('pantry'); }}
          className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'pantry' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <ShoppingBag size={18} />
          <span className="text-[9px] font-medium font-sans">Despensa</span>
          {lowStockPantryCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>

        <button
          onClick={() => { setSelectedRecipe(null); setActiveTab('planning'); }}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'planning' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <Calendar size={18} />
          <span className="text-[9px] font-medium">Menu</span>
        </button>

        <button
          onClick={() => { setSelectedRecipe(null); setActiveTab('shopping'); }}
          className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'shopping' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <ShoppingCart size={18} />
          <span className="text-[9px] font-medium">Compras</span>
          {activeShoppingCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => { setSelectedRecipe(null); setActiveTab('history'); }}
          className={`flex flex-col items-center gap-0.5 relative ${activeTab === 'history' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <History size={18} />
          <span className="text-[9px] font-medium font-sans">Histórico</span>
        </button>
      </div>

      {/* Modal Overlays for Manual Custom Recipe Form */}
      {showManualRecipeForm && (
        <ManualRecipeForm
          initialRecipe={editingRecipe}
          onSave={handleSaveManualRecipe}
          onClose={() => {
            setShowManualRecipeForm(false);
            setEditingRecipe(undefined);
          }}
        />
      )}

      {/* Immersive Walkthrough Overlay for Step-by-Step cooking walkthrough */}
      {activeCookingRecipe && (
        <ActiveCookingWalkthrough
          recipe={activeCookingRecipe}
          servings={cookingServings}
          onClose={() => setActiveCookingRecipe(null)}
          onFinishCooking={handleFinishCooking}
        />
      )}

    </div>
  );
}
