import React, { useState, useMemo } from 'react';
import { ShoppingListItem } from '../types';
import { PANTRY_CATEGORIES } from '../data';
import { Plus, Trash2, CheckSquare, Square, Share2, Clipboard, Printer, ShoppingCart, HelpCircle } from 'lucide-react';

interface ShoppingListManagerProps {
  shoppingList: ShoppingListItem[];
  onUpdateList: (updated: ShoppingListItem[]) => void;
}

export default function ShoppingListManager({
  shoppingList,
  onUpdateList
}: ShoppingListManagerProps) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState('unidade');
  const [newItemCategory, setNewItemCategory] = useState(PANTRY_CATEGORIES[0]);

  // Handle adding custom manual items
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    // Check if item already exists and is unchecked
    const existingIndex = shoppingList.findIndex(
      item => item.name.toLowerCase().trim() === newItemName.toLowerCase().trim() && !item.checked
    );

    if (existingIndex > -1) {
      const updated = [...shoppingList];
      updated[existingIndex].amount += Number(newItemAmount);
      onUpdateList(updated);
    } else {
      const newItem: ShoppingListItem = {
        id: `shop-${Date.now()}`,
        name: newItemName.trim(),
        amount: Number(newItemAmount),
        unit: newItemUnit,
        checked: false,
        category: newItemCategory
      };
      onUpdateList([...shoppingList, newItem]);
    }

    // Reset fields
    setNewItemName('');
    setNewItemAmount(1);
  };

  // Toggle item checked state
  const handleToggleCheck = (id: string) => {
    const updated = shoppingList.map(item => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    onUpdateList(updated);
  };

  // Delete item from list
  const handleDeleteItem = (id: string) => {
    onUpdateList(shoppingList.filter(item => item.id !== id));
  };

  // Clear all checked items
  const handleClearChecked = () => {
    onUpdateList(shoppingList.filter(item => !item.checked));
  };

  // Clear entire list
  const handleClearAll = () => {
    if (confirm('Deseja limpar totalmente sua lista de compras?')) {
      onUpdateList([]);
    }
  };

  // Group items by category for highly organized viewing
  const groupedItems = useMemo<Record<string, ShoppingListItem[]>>(() => {
    const groups: Record<string, ShoppingListItem[]> = {};
    
    shoppingList.forEach(item => {
      const cat = item.category || 'Outros';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });

    return groups;
  }, [shoppingList]);

  // Generate plain text summary for copying or sharing
  const handleShareList = () => {
    if (shoppingList.length === 0) {
      alert('Sua lista de compras está vazia.');
      return;
    }

    let text = '🛒 *MINHA LISTA DE COMPRAS INTELIGENTE*\n\n';
    
    (Object.entries(groupedItems) as [string, ShoppingListItem[]][]).forEach(([category, items]) => {
      text += `*${category.toUpperCase()}*\n`;
      items.forEach(item => {
        const checkMark = item.checked ? '✅' : '⬜';
        const recipeNote = item.recipeTitle ? ` (para ${item.recipeTitle})` : '';
        text += `${checkMark} ${item.amount} ${item.unit} de ${item.name}${recipeNote}\n`;
      });
      text += '\n';
    });

    text += '_Gerado no aplicativo Receitas, Despensa & Cardápio Semanal_';

    navigator.clipboard.writeText(text);
    alert('Lista de compras copiada para a área de transferência em formato organizado!');
  };

  return (
    <div className="space-y-6">
      
      {/* Overview stats and controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
            <ShoppingCart size={22} />
          </div>
          <div>
            <h3 className="text-xl font-serif italic font-bold text-slate-800">
              Sua Lista de Compras ({shoppingList.length})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Itens selecionados das receitas, do estoque da despensa, ou adicionados manualmente por você.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleShareList}
            disabled={shoppingList.length === 0}
            className="flex-1 sm:flex-initial text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer disabled:opacity-50"
          >
            <Share2 size={14} />
            <span>Copiar para Compartilhar</span>
          </button>

          {shoppingList.some(i => i.checked) && (
            <button
              onClick={handleClearChecked}
              className="flex-1 sm:flex-initial text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-amber-200 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Limpar Comprados</span>
            </button>
          )}

          <button
            onClick={handleClearAll}
            disabled={shoppingList.length === 0}
            className="flex-1 sm:flex-initial text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>Limpar Tudo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Item Adder Form (1/3 of space) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-lg font-display font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-orange-500" />
            Adicionar Item Avulso
          </h3>

          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nome do Item</label>
              <input
                type="text"
                required
                placeholder="Ex: Leite condensado, Detergente..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Quantidade</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  value={newItemAmount}
                  onChange={e => setNewItemAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Unidade</label>
                <select
                  value={newItemUnit}
                  onChange={e => setNewItemUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                >
                  <option value="unidade">unidade</option>
                  <option value="g">g (gramas)</option>
                  <option value="kg">kg (quilos)</option>
                  <option value="ml">ml (mililitros)</option>
                  <option value="litro">litro</option>
                  <option value="caixa">caixa</option>
                  <option value="pacote">pacote</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Seção / Categoria</label>
              <select
                value={newItemCategory}
                onChange={e => setNewItemCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              >
                {PANTRY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm shadow shadow-orange-500/10 flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>Adicionar à Lista</span>
            </button>
          </form>
        </div>

        {/* Dynamic Category Lists (2/3 of space) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          {shoppingList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <ShoppingCart size={48} className="mx-auto text-slate-300 stroke-1" />
              <div>
                <p className="text-sm font-medium">Sua lista de compras está vazia!</p>
                <p className="text-xs text-slate-400 mt-1">Adicione itens na caixa ao lado ou a partir das receitas.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.entries(groupedItems) as [string, ShoppingListItem[]][]).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                    {category}
                  </h4>

                  <div className="divide-y divide-slate-100/60">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleCheck(item.id)}
                        className={`flex items-center justify-between py-2.5 px-1 hover:bg-slate-50/50 rounded-xl cursor-pointer transition-all ${
                          item.checked ? 'opacity-55' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            className={`transition-colors ${
                              item.checked ? 'text-emerald-500' : 'text-slate-300'
                            }`}
                          >
                            {item.checked ? (
                              <CheckSquare size={18} className="fill-emerald-50" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>

                          <div>
                            <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {item.name}
                            </span>
                            
                            {item.recipeTitle && (
                              <span className="block text-[10px] text-orange-600 bg-orange-50 font-medium px-1.5 py-0.5 rounded-md mt-0.5 w-fit">
                                {item.recipeTitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono font-bold text-slate-600">
                            {item.amount} {item.unit}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg transition-all"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
