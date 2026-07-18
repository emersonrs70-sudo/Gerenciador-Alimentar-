import React, { useState, useMemo } from 'react';
import { PantryItem, Recipe, ShoppingListItem } from '../types';
import { PANTRY_CATEGORIES } from '../data';
import { Plus, Trash2, Edit3, Save, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { getRecipeMatchScore } from '../utils';

interface PantryManagerProps {
  pantry: PantryItem[];
  recipes: Recipe[];
  onUpdatePantry: (updated: PantryItem[]) => void;
  onAddShoppingListItem: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function PantryManager({
  pantry,
  recipes,
  onUpdatePantry,
  onAddShoppingListItem,
  onSelectRecipe
}: PantryManagerProps) {
  // Tabs for pantry view
  const [activeTab, setActiveTab] = useState<'items' | 'recommendations'>('items');
  
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Input fields for adding new item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(PANTRY_CATEGORIES[0]);
  const [newItemQty, setNewItemQty] = useState<number>(100);
  const [newItemMinQty, setNewItemMinQty] = useState<number>(50);
  const [newItemUnit, setNewItemUnit] = useState('g');

  // Handle adding custom item to pantry
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    // Check if item already exists
    const existingIndex = pantry.findIndex(
      item => item.name.toLowerCase().trim() === newItemName.toLowerCase().trim()
    );

    if (existingIndex > -1) {
      const updated = [...pantry];
      updated[existingIndex].quantity += Number(newItemQty);
      onUpdatePantry(updated);
      alert(`Quantidade de "${newItemName}" atualizada na despensa.`);
    } else {
      const newItem: PantryItem = {
        id: `pantry-${Date.now()}`,
        name: newItemName.trim(),
        category: newItemCategory,
        quantity: Number(newItemQty),
        minQuantity: Number(newItemMinQty),
        unit: newItemUnit
      };
      onUpdatePantry([...pantry, newItem]);
    }

    // Reset fields
    setNewItemName('');
    setNewItemQty(100);
    setNewItemMinQty(50);
  };

  // Quick increment/decrement
  const handleAdjustQty = (id: string, amount: number) => {
    const updated = pantry.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + amount);
        return { ...item, quantity: nextQty };
      }
      return item;
    });
    onUpdatePantry(updated);
  };

  // Remove pantry item
  const handleRemoveItem = (id: string) => {
    if (confirm('Tem certeza que deseja remover este item da despensa?')) {
      onUpdatePantry(pantry.filter(item => item.id !== id));
    }
  };

  // Smart suggestions calculated based on ingredients in pantry
  const recommendedRecipes = useMemo(() => {
    return recipes
      .map(recipe => getRecipeMatchScore(recipe, pantry))
      .sort((a, b) => b.percentage - a.percentage); // Sort descending by match score
  }, [recipes, pantry]);

  // Filtered pantry items
  const filteredPantry = useMemo(() => {
    if (selectedCategory === 'Todos') return pantry;
    return pantry.filter(item => item.category === selectedCategory);
  }, [pantry, selectedCategory]);

  // Count low stock items for visual highlights
  const lowStockItems = useMemo(() => {
    return pantry.filter(item => item.quantity <= item.minQuantity);
  }, [pantry]);

  return (
    <div class="space-y-6">
      
      {/* Header and warnings alert box */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/10 flex flex-col justify-between">
          <div>
            <span class="text-xs uppercase tracking-wider text-orange-100 font-medium">Situação da Despensa</span>
            <h4 class="text-3xl font-serif italic font-bold mt-1">{pantry.length} Ingredientes</h4>
          </div>
          <p class="text-xs text-orange-50 mt-4 leading-relaxed">
            Mantenha seu estoque atualizado para receber recomendações de receitas perfeitas.
          </p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs uppercase tracking-wider text-slate-400 font-medium">Itens Acabando</span>
              <h4 class="text-3xl font-serif italic font-bold text-slate-800 mt-1">{lowStockItems.length} Alertas</h4>
            </div>
            <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div class="mt-4">
            {lowStockItems.length > 0 ? (
              <span class="text-xs text-amber-600 font-medium flex items-center gap-1">
                Atenção: alguns itens cruciais estão abaixo do mínimo!
              </span>
            ) : (
              <span class="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> Despensa totalmente abastecida!
              </span>
            )}
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs uppercase tracking-wider text-slate-400 font-medium">Receitas Prontas</span>
              <h4 class="text-3xl font-serif italic font-bold text-slate-800 mt-1">
                {recommendedRecipes.filter(r => r.percentage === 100).length} Pratos
              </h4>
            </div>
            <div class="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles size={20} />
            </div>
          </div>
          <p class="text-xs text-slate-500 mt-4 leading-relaxed">
            Receitas com 100% de ingredientes disponíveis em sua casa neste momento.
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div class="flex border-b border-slate-100 bg-white p-1 rounded-xl shadow-sm">
        <button
          onClick={() => setActiveTab('items')}
          class={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'items'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Estoque da Despensa</span>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          class={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'recommendations'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={16} class={activeTab === 'recommendations' ? 'text-yellow-400' : 'text-slate-400'} />
          <span>Recomendações Inteligentes ({recipes.length})</span>
        </button>
      </div>

      {/* Tab 1: Stock list and Item Builder */}
      {activeTab === 'items' && (
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Item Builder form (1/3 of space) */}
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 class="text-lg font-display font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={18} class="text-orange-500" />
              Adicionar Ingrediente
            </h3>
            
            <form onSubmit={handleAddItem} class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Nome do Item</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Peito de Frango, Azeite, Farinha..."
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  >
                    {PANTRY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">Unidade</label>
                  <select
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value)}
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  >
                    <option value="g">g (gramas)</option>
                    <option value="kg">kg (quilos)</option>
                    <option value="ml">ml (mililitros)</option>
                    <option value="unidades">unidades</option>
                    <option value="colheres de sopa">colheres de sopa</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">Quantidade Atual</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItemQty}
                    onChange={e => setNewItemQty(Number(e.target.value))}
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1">Qtd Mínima Alerta</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItemMinQty}
                    onChange={e => setNewItemMinQty(Number(e.target.value))}
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm shadow shadow-orange-500/10 flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                <span>Salvar na Despensa</span>
              </button>
            </form>
          </div>

          {/* Stock inventory grid list (2/3 of space) */}
          <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            
            {/* Filters bar */}
            <div class="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-2 border-b border-slate-100">
              <h3 class="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
                <Filter size={18} class="text-slate-500" />
                Seu Inventário
              </h3>
              
              <div class="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {['Todos', ...PANTRY_CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    class={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-100 text-slate-900 border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory table */}
            {filteredPantry.length === 0 ? (
              <div class="text-center py-12 text-slate-400">
                <p class="text-sm">Nenhum ingrediente encontrado nesta categoria.</p>
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  class="text-xs text-orange-500 hover:underline mt-2"
                >
                  Limpar filtro de categoria
                </button>
              </div>
            ) : (
              <div class="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                {filteredPantry.map(item => {
                  const isLow = item.quantity <= item.minQuantity;
                  const isZero = item.quantity === 0;

                  return (
                    <div key={item.id} class="py-3 flex items-center justify-between group">
                      <div class="space-y-0.5">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-slate-800 text-sm">{item.name}</span>
                          <span class="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                            {item.category}
                          </span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-slate-400">
                          <span>Mínimo ideal: {item.minQuantity} {item.unit}</span>
                          {isZero ? (
                            <span class="text-rose-500 font-semibold uppercase text-[10px] bg-rose-50 px-1 rounded">Esgotado!</span>
                          ) : isLow ? (
                            <span class="text-amber-600 font-semibold uppercase text-[10px] bg-amber-50 px-1 rounded">Acabando!</span>
                          ) : (
                            <span class="text-emerald-600 font-medium uppercase text-[10px] bg-emerald-50 px-1 rounded">Ok</span>
                          )}
                        </div>
                      </div>

                      <div class="flex items-center gap-4">
                        {/* Quantity Adjusters */}
                        <div class="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <button
                            onClick={() => handleAdjustQty(item.id, item.unit === 'g' || item.unit === 'ml' ? -50 : -1)}
                            class="w-7 h-7 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 flex items-center justify-center font-bold text-sm transition-all"
                            title="Remover"
                          >
                            -
                          </button>
                          
                          <span class="text-xs font-semibold text-slate-800 w-20 text-center font-mono">
                            {item.quantity} {item.unit}
                          </span>
                          
                          <button
                            onClick={() => handleAdjustQty(item.id, item.unit === 'g' || item.unit === 'ml' ? 50 : 1)}
                            class="w-7 h-7 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 flex items-center justify-center font-bold text-sm transition-all"
                            title="Adicionar"
                          >
                            +
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div class="flex items-center gap-1.5">
                          {isLow && (
                            <button
                              onClick={() => {
                                const deficit = Math.max(1, item.minQuantity * 2 - item.quantity);
                                onAddShoppingListItem({
                                  name: item.name,
                                  amount: deficit,
                                  unit: item.unit,
                                  category: item.category
                                });
                                alert(`"${item.name}" adicionado à lista de compras para reposição!`);
                              }}
                              class="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                              title="Adicionar falta à Lista de Compras"
                            >
                              <Plus size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Smart recipe recommendations based on pantry items */}
      {activeTab === 'recommendations' && (
        <div class="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-lg font-display font-semibold text-slate-800">
                Receitas Ideais com Base no que Você Tem
              </h3>
              <p class="text-xs text-slate-400">
                Classificadas pela porcentagem de ingredientes atualmente disponíveis na sua despensa.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedRecipes.map(({ recipe, percentage, availableCount, totalCount, missingIngredients }) => {
              // Color class based on availability
              const colorClass = 
                percentage === 100 
                  ? 'border-emerald-200 bg-emerald-50/10' 
                  : percentage >= 50 
                  ? 'border-amber-200 bg-amber-50/10' 
                  : 'border-slate-100 bg-slate-50/10';

              return (
                <div
                  key={recipe.id}
                  class={`flex flex-col justify-between p-4 rounded-2xl border ${colorClass} transition-all`}
                >
                  <div class="flex gap-3">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      referrerPolicy="no-referrer"
                      class="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 class="font-display font-semibold text-slate-800 text-sm leading-snug">
                        {recipe.title}
                      </h4>
                      <p class="text-xs text-slate-400 font-light line-clamp-1 mt-0.5">
                        {recipe.description}
                      </p>
                      
                      <div class="flex items-center gap-1.5 mt-2">
                        <span class={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          percentage === 100 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : percentage >= 50 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {percentage}% disponível
                        </span>
                        <span class="text-xs text-slate-500 font-mono text-[11px]">
                          ({availableCount} de {totalCount} itens)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="text-xs">
                      {missingIngredients.length > 0 ? (
                        <p class="text-slate-400 font-light truncate max-w-xs">
                          Falta: <span class="text-orange-500 font-normal">{missingIngredients.join(', ')}</span>
                        </p>
                      ) : (
                        <p class="text-emerald-600 font-medium">Todos os itens em estoque! 🎉</p>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectRecipe(recipe)}
                      class="bg-slate-900 hover:bg-slate-800 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shrink-0 self-end sm:self-auto"
                    >
                      <span>Ver Receita</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
