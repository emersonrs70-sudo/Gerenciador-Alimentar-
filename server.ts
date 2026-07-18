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
