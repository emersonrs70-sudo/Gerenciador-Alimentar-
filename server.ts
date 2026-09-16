import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy and ready!" });
});

// Chef AI recipe generator endpoint
app.post("/api/generate-recipe", async (req, res) => {
  try {
    const { ingredients, diet, difficulty, category } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "Chave de API do Gemini (GEMINI_API_KEY) não configurada no painel de Secrets."
      });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Nenhum ingrediente foi fornecido." });
    }

    const ingredientsStr = ingredients.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(", ");

    const prompt = `Você é um Chef de Cozinha Inteligente. Crie uma receita deliciosa, viável e criativa em PORTUGUÊS usando (mas não se limitando apenas a) os seguintes ingredientes que o usuário possui em estoque:
${ingredientsStr}.

A receita deve atender a estas especificações:
- Dieta: ${diet || 'Sem preferência'} (Fit, Fim de Semana ou Calórica)
- Dificuldade: ${difficulty || 'Médio'} (Fácil, Médio ou Difícil)
- Categoria: ${category || 'Dia a Dia'} (Dia a Dia ou Domingo)

Certifique-se de que a receita faça sentido e que os passos do modo de preparo sejam claros, organizados e detalhados.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um chef gourmet profissional que ajuda as pessoas a criarem receitas baseadas no que elas têm na despensa. Forneça respostas estritamente estruturadas em JSON que sigam o esquema especificado. O campo 'image' deve conter um termo de busca conciso para imagens de comida em inglês (ex: 'chicken-strogonoff', 'grilled-salmon-asparagus').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Nome elegante e atraente da receita em português" },
            description: { type: Type.STRING, description: "Uma descrição curta e apetitosa do prato em português" },
            prepTime: { type: Type.INTEGER, description: "Tempo estimado de preparo em minutos" },
            difficulty: { type: Type.STRING, description: "Deve ser exatamente: 'Fácil', 'Médio' ou 'Difícil'" },
            diet: { type: Type.STRING, description: "Deve ser exatamente: 'Fit', 'Fim de Semana' ou 'Calórica'" },
            category: { type: Type.STRING, description: "Deve ser exatamente: 'Dia a Dia' ou 'Domingo'" },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nome do ingrediente" },
                  amount: { type: Type.NUMBER, description: "Quantidade numérica necessária" },
                  unit: { type: Type.STRING, description: "Unidade de medida (ex: g, ml, colher de sopa, unidade)" }
                },
                required: ["name", "amount", "unit"]
              }
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING, description: "Passo a passo sequencial da receita" }
            },
            servings: { type: Type.INTEGER, description: "Número de porções que rende" },
            calories: { type: Type.INTEGER, description: "Estimativa de calorias totais por porção" },
            image: { type: Type.STRING, description: "Termo simples de busca em inglês para comida (ex: 'pancakes', 'risotto')" }
          },
          required: [
            "title",
            "description",
            "prepTime",
            "difficulty",
            "diet",
            "category",
            "ingredients",
            "instructions",
            "servings",
            "image"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("O modelo gerou uma resposta vazia.");
    }

    const recipeData = JSON.parse(text);
    
    // Add unique ID and isChefAI flag
    const generatedRecipe = {
      ...recipeData,
      id: `chef-ai-${Date.now()}`,
      isChefAI: true,
      // Convert search term to an actual Unsplash image URL or fallback to a gorgeous general food photo
      image: recipeData.image 
        ? `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80&sig=${encodeURIComponent(recipeData.image)}`
        : `https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80`
    };

    res.json(generatedRecipe);
  } catch (error: any) {
    console.error("Error generating recipe via Gemini:", error);
    res.status(500).json({
      error: "Ocorreu um erro ao gerar a receita utilizando inteligência artificial.",
      details: error.message
    });
  }
});

// Search new recipe endpoint that generates a new recipe based on a search query
app.post("/api/search-new-recipe", async (req, res) => {
  try {
    const { query } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "Chave de API do Gemini (GEMINI_API_KEY) não configurada no painel de Secrets."
      });
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Nenhum prato foi fornecido para a busca." });
    }

    const prompt = `Você é um Chef de Cozinha Inteligente. O usuário quer a receita exata para: "${query}". Crie uma receita maravilhosa, precisa e autêntica em PORTUGUÊS para este prato.
    
Certifique-se de que a receita faça sentido e que os passos do modo de preparo sejam claros, organizados e detalhados. Se o termo digitado não for um prato de comida válido ou for sem sentido, crie uma receita criativa de comida real que se assemelhe ou seja inspirada pelo termo.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um chef gourmet profissional que cria receitas detalhadas baseadas no desejo de prato do usuário. Forneça respostas estritamente estruturadas em JSON que sigam o esquema especificado. O campo 'image' deve conter um termo de busca conciso para imagens de comida em inglês (ex: 'lasagna', 'caesar-salad', 'carrot-cake').",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Nome elegante e atraente da receita em português" },
            description: { type: Type.STRING, description: "Uma descrição curta e apetitosa do prato em português" },
            prepTime: { type: Type.INTEGER, description: "Tempo estimado de preparo em minutos" },
            difficulty: { type: Type.STRING, description: "Deve ser exatamente: 'Fácil', 'Médio' ou 'Difícil'" },
            diet: { type: Type.STRING, description: "Deve ser exatamente: 'Fit', 'Fim de Semana' ou 'Calórica'" },
            category: { type: Type.STRING, description: "Deve ser exatamente: 'Dia a Dia' ou 'Domingo'" },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nome do ingrediente" },
                  amount: { type: Type.NUMBER, description: "Quantidade numérica necessária" },
                  unit: { type: Type.STRING, description: "Unidade de medida (ex: g, ml, colher de sopa, unidade)" }
                },
                required: ["name", "amount", "unit"]
              }
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING, description: "Passo a passo sequencial da receita" }
            },
            servings: { type: Type.INTEGER, description: "Número de porções que rende" },
            calories: { type: Type.INTEGER, description: "Estimativa de calorias totais por porção" },
            image: { type: Type.STRING, description: "Termo simples de busca em inglês para comida (ex: 'pancakes', 'risotto')" }
          },
          required: [
            "title",
            "description",
            "prepTime",
            "difficulty",
            "diet",
            "category",
            "ingredients",
            "instructions",
            "servings",
            "image"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("O modelo gerou uma resposta vazia.");
    }

    const recipeData = JSON.parse(text);
    
    // Add unique ID and isChefAI flag
    const generatedRecipe = {
      ...recipeData,
      id: `chef-ai-${Date.now()}`,
      isChefAI: true,
      // Convert search term to an actual Unsplash image URL or fallback to a gorgeous general food photo
      image: recipeData.image 
        ? `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80&sig=${encodeURIComponent(recipeData.image)}`
        : `https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80`
    };

    res.json(generatedRecipe);
  } catch (error: any) {
    console.error("Error generating searched recipe via Gemini:", error);
    res.status(500).json({
      error: "Ocorreu um erro ao buscar e criar essa nova receita.",
      details: error.message
    });
  }
});

// Adapt existing recipe based on diet constraints endpoint
app.post("/api/adapt-recipe", async (req, res) => {
  try {
    const { recipe, dietGoal } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "Chave de API do Gemini (GEMINI_API_KEY) não configurada no painel de Secrets."
      });
    }

    if (!recipe || !dietGoal) {
      return res.status(400).json({ error: "Receita ou objetivo de dieta não fornecido." });
    }

    const prompt = `Você é um Chef de Cozinha Inteligente especializado em nutrição e substituições. Adapte a receita "${recipe.title}" para ser uma versão "${dietGoal}".

Aqui estão os dados da receita original:
Descrição: ${recipe.description}
Ingredientes Originais: ${JSON.stringify(recipe.ingredients)}
Instruções Originais: ${JSON.stringify(recipe.instructions)}

Instruções importantes:
1. Altere os ingredientes que contêm glúten, lactose ou produtos de origem animal se o objetivo de dieta demandar (ex: se "Vegana", substitua carnes, queijos, leite por alternativas vegetais).
2. Forneça substitutos realistas e deliciosos.
3. Adapte os passos do modo de preparo para refletir os novos ingredientes.
4. Mantenha ou ajuste as calorias e o tempo de preparo de forma realista.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `Você é um chef gourmet que adapta receitas existentes para atender a restrições dietéticas específicas (ex: sem glúten, vegana, sem lactose, low carb). Forneça uma receita completa adaptada estritamente estruturada em JSON seguindo o esquema fornecido. Mantenha o id da receita se possível, ou retorne as propriedades atualizadas de forma idêntica à estrutura da receita original.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título novo e adaptado para a receita (ex: 'Lasanha Vegana de Abobrinha')" },
            description: { type: Type.STRING, description: "Uma descrição sobre as substituições saudáveis que foram feitas nesta versão" },
            prepTime: { type: Type.INTEGER, description: "Tempo de preparo estimado em minutos" },
            difficulty: { type: Type.STRING, description: "Fácil, Médio ou Difícil" },
            diet: { type: Type.STRING, description: "O novo tipo de dieta (deve ser 'Fit', 'Fim de Semana' ou 'Calórica')" },
            category: { type: Type.STRING, description: "O tipo de categoria original ou adaptada" },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                },
                required: ["name", "amount", "unit"]
              }
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            servings: { type: Type.INTEGER },
            calories: { type: Type.INTEGER, description: "Estimativa atualizada de calorias totais por porção" }
          },
          required: [
            "title",
            "description",
            "prepTime",
            "difficulty",
            "diet",
            "ingredients",
            "instructions",
            "servings"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("O modelo gerou uma resposta vazia.");
    }

    const adaptedData = JSON.parse(text);
    const adaptedRecipe = {
      ...recipe,
      ...adaptedData,
      id: `adapted-${recipe.id}-${Date.now()}`,
      isChefAI: true
    };

    res.json(adaptedRecipe);
  } catch (error: any) {
    console.error("Error adapting recipe via Gemini:", error);
    res.status(500).json({
      error: "Ocorreu um erro ao adaptar a receita utilizando inteligência artificial.",
      details: error.message
    });
  }
});

// Setup Vite Dev Middleware vs Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
