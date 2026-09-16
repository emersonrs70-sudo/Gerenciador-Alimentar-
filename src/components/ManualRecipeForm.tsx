import React, { useState } from 'react';
import { Recipe, RecipeDifficulty, RecipeDiet, RecipeCategory, RecipeIngredient } from '../types';
import { X, Plus, Trash2, Check, BookOpen, AlertCircle } from 'lucide-react';

const UNSPLASH_PRESETS = [
  { name: 'Geral', url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80' },
  { name: 'Massas', url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=80' },
  { name: 'Salada', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Bolo / Doce', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80' },
  { name: 'Carnes', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sopa', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80' }
];

interface ManualRecipeFormProps {
  initialRecipe?: Recipe;
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
}

export default function ManualRecipeForm({
  initialRecipe,
  onSave,
  onClose
}: ManualRecipeFormProps) {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [image, setImage] = useState(initialRecipe?.image || UNSPLASH_PRESETS[0].url);
  const [prepTime, setPrepTime] = useState(initialRecipe?.prepTime || 30);
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [calories, setCalories] = useState(initialRecipe?.calories || 250);
  
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>(initialRecipe?.difficulty || 'Médio');
  const [diet, setDiet] = useState<RecipeDiet>(initialRecipe?.diet || 'Fit');
  const [category, setCategory] = useState<RecipeCategory>(initialRecipe?.category || 'Dia a Dia');

  // Dynamic lists states
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    initialRecipe?.ingredients || [{ name: '', amount: 1, unit: 'unidade' }]
  );
  
  const [instructions, setInstructions] = useState<string[]>(
    initialRecipe?.instructions || ['']
  );

  const [validationError, setValidationError] = useState('');

  // Handle dynamic additions
  const handleAddIngredient = () => {
    setIngredients(prev => [...prev, { name: '', amount: 1, unit: 'g' }]);
  };

  const handleRemoveIngredient = (idx: number) => {
    if (ingredients.length === 1) return;
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (idx: number, field: keyof RecipeIngredient, value: any) => {
    setIngredients(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleAddStep = () => {
    setInstructions(prev => [...prev, '']);
  };

  const handleRemoveStep = (idx: number) => {
    if (instructions.length === 1) return;
    setInstructions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx: number, value: string) => {
    setInstructions(prev => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // validations
    if (title.trim().length === 0) {
      setValidationError('Por favor, informe o título da receita.');
      return;
    }

    const filteredIngs = ingredients.filter(i => i.name.trim().length > 0);
    if (filteredIngs.length === 0) {
      setValidationError('Por favor, adicione pelo menos um ingrediente válido.');
      return;
    }

    const filteredSteps = instructions.filter(s => s.trim().length > 0);
    if (filteredSteps.length === 0) {
      setValidationError('Por favor, descreva pelo menos um passo do preparo.');
      return;
    }

    const savedRecipe: Recipe = {
      id: initialRecipe?.id || `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Receita caseira adicionada manualmente.',
      image,
      prepTime: Number(prepTime) || 30,
      servings: Number(servings) || 4,
      calories: Number(calories) || undefined,
      difficulty,
      diet,
      category,
      ingredients: filteredIngs,
      instructions: filteredSteps,
      isChefAI: false // Marked as custom/manual
    };

    onSave(savedRecipe);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-xl font-serif italic font-bold text-slate-800">
                {initialRecipe ? 'Editar Minha Receita' : 'Adicionar Receita Manual'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crie ou edite suas próprias receitas caseiras para integrá-las à despensa e ao planejador.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {validationError && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Core Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-1.5">
                  Título da Receita *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Torta de Maçã da Vovó"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-1.5">
                  Descrição Rápida
                </label>
                <textarea
                  rows={2}
                  placeholder="Uma introdução atraente para sua receita especial..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-1.5">
                    Preparo (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prepTime}
                    onChange={e => setPrepTime(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-1.5">
                    Rendimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={e => setServings(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-1.5">
                    Calorias (porção)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calories}
                    onChange={e => setCalories(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Image selection and attributes */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-display uppercase tracking-wider text-slate-400 mb-1.5">
                  Imagem de Capa (URL ou Atalho)
                </label>
                <input
                  type="text"
                  placeholder="Cole uma URL de foto ou clique em um atalho abaixo"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 transition-all font-mono"
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">Presilhas Rápidas de Fotos</span>
                <div className="grid grid-cols-3 gap-2">
                  {UNSPLASH_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(p.url)}
                      className={`text-[11px] py-1 px-2 border rounded-xl font-semibold text-center transition-all truncate cursor-pointer ${
                        image === p.url
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Characteristics selectors */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Dificuldade</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as RecipeDifficulty)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 font-semibold"
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Médio">Médio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Dieta</label>
                  <select
                    value={diet}
                    onChange={e => setDiet(e.target.value as RecipeDiet)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 font-semibold"
                  >
                    <option value="Fit">Fit</option>
                    <option value="Fim de Semana">Fim de Semana</option>
                    <option value="Calórica">Calórica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Ocasião</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as RecipeCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-700 font-semibold"
                  >
                    <option value="Dia a Dia">Dia a Dia</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients list dynamic selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-serif italic font-bold text-slate-800">
                Lista de Ingredientes Necessários *
              </h4>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <input
                    type="text"
                    required
                    placeholder="Ingrediente (ex: Açúcar)"
                    value={ing.name}
                    onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    placeholder="Qtd"
                    value={ing.amount}
                    onChange={e => handleIngredientChange(idx, 'amount', Number(e.target.value))}
                    className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 text-center"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Unid (ex: g, xícara)"
                    value={ing.unit}
                    onChange={e => handleIngredientChange(idx, 'unit', e.target.value)}
                    className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    disabled={ingredients.length === 1}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions list steps dynamic selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-serif italic font-bold text-slate-800">
                Instruções de Modo de Preparo (Passo a Passo) *
              </h4>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Adicionar Passo</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-serif font-bold italic text-sm text-orange-600 pt-1.5 pl-1.5 shrink-0 w-6">
                    {idx + 1}.
                  </span>
                  <textarea
                    required
                    rows={2}
                    placeholder={`Descreva o que fazer no passo ${idx + 1}...`}
                    value={step}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    disabled={instructions.length === 1}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </form>

        {/* Action Controls */}
        <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleFormSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/15 cursor-pointer"
          >
            <Check size={16} />
            <span>Salvar Receita</span>
          </button>
        </div>

      </div>
    </div>
  );
}
