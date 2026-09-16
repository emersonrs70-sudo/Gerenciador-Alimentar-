export type RecipeDifficulty = 'Fácil' | 'Médio' | 'Difícil';
export type RecipeDiet = 'Fit' | 'Fim de Semana' | 'Calórica';
export type RecipeCategory = 'Dia a Dia' | 'Domingo';

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number; // in minutes
  difficulty: RecipeDifficulty;
  diet: RecipeDiet;
  category: RecipeCategory;
  ingredients: RecipeIngredient[];
  instructions: string[];
  servings: number;
  calories?: number;
  isChefAI?: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  category: string;
}

export type DayOfWeek = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';
export type MealTime = 'Café da Manhã' | 'Almoço' | 'Jantar';

export interface WeeklyPlan {
  id: string;
  day: DayOfWeek;
  meal: MealTime;
  recipeId: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
  category: string;
  recipeTitle?: string; // Optional reference to where it came from
}

export interface CookingHistoryEntry {
  id: string;
  recipeId: string;
  recipeTitle: string;
  recipeImage: string;
  cookedAt: string;
  servings: number;
  calories: number;
  difficulty: RecipeDifficulty;
  diet: RecipeDiet;
}

