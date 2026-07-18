import { Recipe, PantryItem, ShoppingListItem } from './types';

/**
 * Normalizes strings for loose/fuzzy matching
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .trim();
}

/**
 * Checks if a recipe ingredient is in stock in the pantry.
 * Returns the pantry item if found, and whether it has sufficient quantity.
 */
export function checkIngredientInPantry(
  recipeIngName: string,
  pantry: PantryItem[]
): { pantryItem: PantryItem | null; isSufficient: boolean; hasAny: boolean } {
  const normalizedRecipeIng = normalizeString(recipeIngName);
  
  // Find a pantry item that closely matches the recipe ingredient name
  const match = pantry.find(item => {
    const normalizedPantryItem = normalizeString(item.name);
    return normalizedPantryItem.includes(normalizedRecipeIng) || normalizedRecipeIng.includes(normalizedPantryItem);
  });

  if (!match) {
    return { pantryItem: null, isSufficient: false, hasAny: false };
  }

  return {
    pantryItem: match,
    isSufficient: match.quantity > 0, // In simple terms, as long as we have some, it's green. Or we can match quantities if units align
    hasAny: match.quantity > 0
  };
}

/**
 * Calculates a recipe's stock match score.
 * Score is the percentage of ingredients that are currently available in the pantry.
 */
export interface RecipeMatchInfo {
  recipe: Recipe;
  availableCount: number;
  totalCount: number;
  percentage: number;
  missingIngredients: string[];
}

export function getRecipeMatchScore(recipe: Recipe, pantry: PantryItem[]): RecipeMatchInfo {
  let availableCount = 0;
  const missingIngredients: string[] = [];

  recipe.ingredients.forEach(ing => {
    const { hasAny } = checkIngredientInPantry(ing.name, pantry);
    if (hasAny) {
      availableCount++;
    } else {
      missingIngredients.push(ing.name);
    }
  });

  const totalCount = recipe.ingredients.length;
  const percentage = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;

  return {
    recipe,
    availableCount,
    totalCount,
    percentage,
    missingIngredients
  };
}

/**
 * Suggests items that are low in stock to be added to the shopping list.
 */
export function getLowStockPantryItems(pantry: PantryItem[]): PantryItem[] {
  return pantry.filter(item => item.quantity <= item.minQuantity);
}
