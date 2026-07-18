import { Recipe, PantryItem } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Strogonoff de Frango Cremoso',
    description: 'Um clássico brasileiro irresistível, cremoso e super rápido para qualquer dia da semana.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    prepTime: 30,
    difficulty: 'Fácil',
    diet: 'Calórica',
    category: 'Dia a Dia',
    servings: 4,
    calories: 480,
    ingredients: [
      { name: 'Peito de Frango', amount: 500, unit: 'g' },
      { name: 'Creme de Leite', amount: 1, unit: 'unidade' },
      { name: 'Molho de Tomate', amount: 1, unit: 'unidade' },
      { name: 'Alho', amount: 3, unit: 'dentes' },
      { name: 'Cebola', amount: 1, unit: 'unidade' },
      { name: 'Azeite', amount: 2, unit: 'colheres de sopa' },
      { name: 'Sal', amount: 5, unit: 'g' },
      { name: 'Batata Palha', amount: 100, unit: 'g' }
    ],
    instructions: [
      'Corte o frango em cubos pequenos e tempere com sal e alho amassado.',
      'Em uma panela, aqueça o azeite e refogue a cebola picadinha até dourar.',
      'Adicione o frango e mexa até dourar por completo.',
      'Acrescente o molho de tomate e deixe cozinhar por 5 minutos em fogo baixo.',
      'Desligue o fogo, adicione o creme de leite e misture bem até ficar homogêneo.',
      'Sirva bem quente acompanhado de arroz branco e batata palha fresca.'
    ]
  },
  {
    id: '2',
    title: 'Salmão Grelhado com Ervas e Aspargos',
    description: 'Receita leve, saudável e com apresentação sofisticada para surpreender no almoço de domingo.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80',
    prepTime: 25,
    difficulty: 'Médio',
    diet: 'Fit',
    category: 'Domingo',
    servings: 2,
    calories: 320,
    ingredients: [
      { name: 'Salmão', amount: 400, unit: 'g' },
      { name: 'Aspargos', amount: 200, unit: 'g' },
      { name: 'Azeite', amount: 3, unit: 'colheres de sopa' },
      { name: 'Limão', amount: 1, unit: 'unidade' },
      { name: 'Alho', amount: 2, unit: 'dentes' },
      { name: 'Sal', amount: 3, unit: 'g' },
      { name: 'Alecrim', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Tempere os filés de salmão com sal, alho picado, limão espremido e raminhos de alecrim.',
      'Lave os aspargos e quebre a base lenhosa dos talos.',
      'Aqueça uma colher de azeite em uma frigideira antiaderente e grelhe os aspargos até ficarem macios e levemente tostados. Reserve.',
      'Na mesma frigideira, adicione o restante do azeite e grelhe o salmão por 4 a 5 minutos de cada lado (começando com a pele para baixo).',
      'Monte o prato colocando os aspargos como base e o salmão por cima. Finalize com gotas de limão e azeite extra virgem.'
    ]
  },
  {
    id: '3',
    title: 'Lasanha Quatro Queijos Divina',
    description: 'A lasanha perfeita para reunir a família no almoço de domingo. Uma explosão de sabores cremosos.',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
    prepTime: 60,
    difficulty: 'Difícil',
    diet: 'Fim de Semana',
    category: 'Domingo',
    servings: 6,
    calories: 680,
    ingredients: [
      { name: 'Massa de Lasanha', amount: 300, unit: 'g' },
      { name: 'Queijo Muçarela', amount: 300, unit: 'g' },
      { name: 'Queijo Gorgonzola', amount: 100, unit: 'g' },
      { name: 'Queijo Parmesão', amount: 100, unit: 'g' },
      { name: 'Leite', amount: 1, unit: 'litro' },
      { name: 'Manteiga', amount: 2, unit: 'colheres de sopa' },
      { name: 'Farinha de Trigo', amount: 2, unit: 'colheres de sopa' },
      { name: 'Creme de Leite', amount: 1, unit: 'unidade' },
      { name: 'Noz-moscada', amount: 2, unit: 'g' },
      { name: 'Sal', amount: 4, unit: 'g' }
    ],
    instructions: [
      'Prepare o molho branco: em uma panela, derreta a manteiga e adicione a farinha de trigo, mexendo por 2 minutos para dourar.',
      'Adicione o leite aos poucos, mexendo sempre com um batedor de arame para não empelotar. Cozinhe até engrossar.',
      'Tempere o molho branco com sal e noz-moscada ralada na hora. Desligue o fogo e misture o creme de leite.',
      'Em uma travessa refratária, monte as camadas: molho branco, massa de lasanha, queijo muçarela, queijo gorgonzola esfarelado e o molho novamente.',
      'Repita as camadas até preencher o refratário, finalizando com bastante queijo parat ou parmegiano para gratinar.',
      'Leve ao forno preaquecido a 180°C por cerca de 35 a 40 minutos até dourar e borbulhar.'
    ]
  },
  {
    id: '4',
    title: 'Omelete Super Fit Proteico',
    description: 'Uma refeição completa, rápida e com baixas calorias. Ideal para o pós-treino ou jantar rápido.',
    image: 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=600&auto=format&fit=crop&q=80',
    prepTime: 10,
    difficulty: 'Fácil',
    diet: 'Fit',
    category: 'Dia a Dia',
    servings: 1,
    calories: 210,
    ingredients: [
      { name: 'Ovos', amount: 3, unit: 'unidades' },
      { name: 'Espinafre', amount: 50, unit: 'g' },
      { name: 'Tomate Cereja', amount: 5, unit: 'unidades' },
      { name: 'Queijo Ricota', amount: 50, unit: 'g' },
      { name: 'Azeite', amount: 1, unit: 'colher de chá' },
      { name: 'Sal', amount: 1.5, unit: 'g' }
    ],
    instructions: [
      'Bata os ovos energicamente em um bowl com uma pitada de sal.',
      'Lave e pique os tomates cereja e o espinafre fresco.',
      'Aqueça uma frigideira antiaderente untada com a colher de azeite.',
      'Despeje os ovos batidos e adicione o espinafre, os tomates e a ricota esfarelada por cima.',
      'Cozinhe em fogo baixo com a frigideira tampada por 3 minutos.',
      'Dobre a omelete ao meio com cuidado e cozinhe por mais 1 minuto até o queijo ricota aquecer.'
    ]
  },
  {
    id: '5',
    title: 'Nhoque de Batata Doce Fit',
    description: 'Uma versão saudável e funcional do tradicional nhoque italiano, feito com batata doce.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
    prepTime: 40,
    difficulty: 'Médio',
    diet: 'Fit',
    category: 'Dia a Dia',
    servings: 3,
    calories: 290,
    ingredients: [
      { name: 'Batata Doce', amount: 500, unit: 'g' },
      { name: 'Farinha de Aveia', amount: 150, unit: 'g' },
      { name: 'Molho de Tomate', amount: 1, unit: 'unidade' },
      { name: 'Sal', amount: 2, unit: 'g' },
      { name: 'Azeite', amount: 1, unit: 'colher de sopa' }
    ],
    instructions: [
      'Cozinhe as batatas doces com casca até que fiquem bem macias. Descasque e esmague-as ainda quentes até obter um purê liso.',
      'Adicione sal e a farinha de aveia aos poucos, amassando com as mãos até que a massa solte das mãos e fique moldável.',
      'Faça rolinhos compridos na bancada polvilhada e corte os nhoques com uma faca.',
      'Cozinhe os nhoques em água fervente com sal. Assim que subirem à superfície, retire-os com uma escumadeira.',
      'Sirva com um molho de tomate caseiro aquecido e finalize com folhas de manjericão.'
    ]
  },
  {
    id: '6',
    title: 'Feijoada de Sábado Tradicional',
    description: 'A verdadeira feijoada brasileira, rica em carnes e sabor defumado para o sábado perfeito.',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    prepTime: 120,
    difficulty: 'Difícil',
    diet: 'Calórica',
    category: 'Domingo',
    servings: 8,
    calories: 790,
    ingredients: [
      { name: 'Feijão Preto', amount: 500, unit: 'g' },
      { name: 'Linguiça Calabresa', amount: 200, unit: 'g' },
      { name: 'Carne Seca', amount: 200, unit: 'g' },
      { name: 'Bacon', amount: 150, unit: 'g' },
      { name: 'Alho', amount: 4, unit: 'dentes' },
      { name: 'Cebola', amount: 2, unit: 'unidades' },
      { name: 'Couve', amount: 1, unit: 'maço' },
      { name: 'Azeite', amount: 2, unit: 'colheres de sopa' }
    ],
    instructions: [
      'Deixe o feijão preto de molho por 12 horas. Faça o mesmo com a carne seca para dessalgar, trocando a água periodicamente.',
      'Cozinhe a carne seca em cubos na panela de pressão por 25 minutos.',
      'Em uma panela grande de barro ou ferro, junte o feijão cozido, a carne seca, a calabresa em rodelas e o bacon picado.',
      'Deixe tudo ferver em fogo baixo por cerca de 40 minutos para apurar o caldo e amalgamar os sabores.',
      'Faça um refogado bem caprichado de cebola e alho no azeite e adicione à panela da feijoada nos minutos finais.',
      'Sirva com arroz branco bem soltinho, couve refogada no alho, farofa e gomos de laranja fresca.'
    ]
  },
  {
    id: '7',
    title: 'Arroz de Forno Prático de Sábado',
    description: 'Uma excelente receita para aproveitar sobras ou criar um almoço de sábado super rápido e delicioso.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    prepTime: 20,
    difficulty: 'Fácil',
    diet: 'Fim de Semana',
    category: 'Dia a Dia',
    servings: 4,
    calories: 390,
    ingredients: [
      { name: 'Arroz de Forno', amount: 300, unit: 'g' },
      { name: 'Queijo Muçarela', amount: 150, unit: 'g' },
      { name: 'Creme de Leite', amount: 1, unit: 'unidade' },
      { name: 'Ervilha', amount: 100, unit: 'g' },
      { name: 'Milho', amount: 100, unit: 'g' },
      { name: 'Tomate', amount: 1, unit: 'unidade' }
    ],
    instructions: [
      'Em um recipiente grande, misture o arroz já cozido com o creme de leite, o milho, a ervilha e o tomate picadinho.',
      'Adicione metade do queijo muçarela picado em cubos à mistura.',
      'Transfira tudo para uma assadeira refratária untada.',
      'Cubra com o restante da muçarela e salpique orégano por cima.',
      'Leve ao forno por 15 minutos até gratinar lindamente. Sirva quente.'
    ]
  },
  {
    id: '8',
    title: 'Risoto Milanês com Parmesão',
    description: 'A textura cremosa perfeita unida ao perfume do açafrão. Um prato sofisticado e reconfortante.',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop&q=80',
    prepTime: 35,
    difficulty: 'Médio',
    diet: 'Fim de Semana',
    category: 'Domingo',
    servings: 3,
    calories: 450,
    ingredients: [
      { name: 'Arroz Arbóreo', amount: 250, unit: 'g' },
      { name: 'Cebola', amount: 1, unit: 'unidade' },
      { name: 'Manteiga', amount: 50, unit: 'g' },
      { name: 'Queijo Parmesão', amount: 80, unit: 'g' },
      { name: 'Vinho Branco', amount: 100, unit: 'ml' },
      { name: 'Azeite', amount: 1, unit: 'colher de sopa' },
      { name: 'Açafrão', amount: 1, unit: 'g' }
    ],
    instructions: [
      'Aqueça um caldo de legumes em uma panela ao lado e dissolva o açafrão nele.',
      'Em uma panela de fundo grosso, aqueça o azeite e metade da manteiga. Refogue a cebola picadinha até ficar translúcida.',
      'Adicione o arroz arbóreo e mexa bem por 2 minutos para selar os grãos.',
      'Despeje o vinho branco seco e mexa constantemente até evaporar quase todo o líquido.',
      'Adicione o caldo quente concha por concha, mexendo sempre. Só adicione mais caldo quando o anterior for absorvido.',
      'Após 18 minutos de cozimento (o arroz deve estar al dente), desligue o fogo. Adicione o restante da manteiga gelada e o queijo parmesão ralado na hora. Mexa vigorosamente para dar cremosidade (mantecatura).'
    ]
  },
  {
    id: '9',
    title: 'Panqueca de Banana e Aveia',
    description: 'Comece o dia com energia com esta panqueca ultra rápida, deliciosa, sem açúcar refinado e sem glúten.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80',
    prepTime: 12,
    difficulty: 'Fácil',
    diet: 'Fit',
    category: 'Dia a Dia',
    servings: 1,
    calories: 180,
    ingredients: [
      { name: 'Banana', amount: 2, unit: 'unidades' },
      { name: 'Ovos', amount: 2, unit: 'unidades' },
      { name: 'Aveia em Flocos', amount: 4, unit: 'colheres de sopa' },
      { name: 'Canela', amount: 2, unit: 'g' },
      { name: 'Mel', amount: 1, unit: 'colher de sopa' }
    ],
    instructions: [
      'Esmague as bananas com um garfo em um prato fundo até formar um purê.',
      'Adicione os ovos e bata tudo vigorosamente com o garfo.',
      'Adicione a aveia em flocos e a canela em pó, mexendo bem até ficar homogêneo.',
      'Aqueça uma frigideira antiaderente em fogo baixo (se necessário, unte com um fiozinho de óleo de coco).',
      'Despeje porções da massa. Quando criar bolhas na superfície, vire com uma espátula e doure o outro lado.',
      'Sirva quentinho decorado com rodelas de banana e um fio de mel puro.'
    ]
  },
  {
    id: '10',
    title: 'Brownie de Chocolate Vulcão',
    description: 'Para o dia de "pé na jaca" definitivo. O brownie úmido por dentro com calda quente de chocolate.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    prepTime: 45,
    difficulty: 'Médio',
    diet: 'Calórica',
    category: 'Domingo',
    servings: 8,
    calories: 590,
    ingredients: [
      { name: 'Chocolate em Pó', amount: 200, unit: 'g' },
      { name: 'Manteiga', amount: 150, unit: 'g' },
      { name: 'Açúcar', amount: 200, unit: 'g' },
      { name: 'Farinha de Trigo', amount: 120, unit: 'g' },
      { name: 'Ovos', amount: 3, unit: 'unidades' },
      { name: 'Leite Condensado', amount: 1, unit: 'unidade' }
    ],
    instructions: [
      'Derreta a manteiga com metade do chocolate em pó em banho-maria ou no micro-ondas.',
      'Em outro bowl, bata os ovos com o açúcar até formar um creme esbranquiçado.',
      'Incorpore a calda de manteiga e chocolate aos ovos, misturando delicadamente.',
      'Adicione a farinha de trigo peneirada e misture até obter uma massa pesada e homogênea.',
      'Despeje em uma assadeira forrada com papel manteiga e asse a 180°C por 25 minutos. O centro deve continuar levemente úmido.',
      'Faça um brigadeiro mole com o leite condensado e o restante do chocolate em pó e jogue quente por cima dos pedaços de brownie ao servir.'
    ]
  }
];

export const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p1', name: 'Peito de Frango', quantity: 800, minQuantity: 500, unit: 'g', category: 'Carnes e Frios' },
  { id: 'p2', name: 'Creme de Leite', quantity: 1, minQuantity: 2, unit: 'unidades', category: 'Laticínios' },
  { id: 'p3', name: 'Molho de Tomate', quantity: 3, minQuantity: 1, unit: 'unidades', category: 'Mercearia' },
  { id: 'p4', name: 'Alho', quantity: 5, minQuantity: 3, unit: 'dentes', category: 'Hortifrúti' },
  { id: 'p5', name: 'Cebola', quantity: 4, minQuantity: 2, unit: 'unidades', category: 'Hortifrúti' },
  { id: 'p6', name: 'Azeite', quantity: 100, minQuantity: 250, unit: 'ml', category: 'Mercearia' },
  { id: 'p7', name: 'Sal', quantity: 1000, minQuantity: 200, unit: 'g', category: 'Mercearia' },
  { id: 'p8', name: 'Batata Palha', quantity: 0, minQuantity: 100, unit: 'g', category: 'Mercearia' },
  { id: 'p9', name: 'Salmão', quantity: 0, minQuantity: 400, unit: 'g', category: 'Carnes e Frios' },
  { id: 'p10', name: 'Aspargos', quantity: 0, minQuantity: 200, unit: 'g', category: 'Hortifrúti' },
  { id: 'p11', name: 'Ovos', quantity: 12, minQuantity: 6, unit: 'unidades', category: 'Laticínios' },
  { id: 'p12', name: 'Banana', quantity: 2, minQuantity: 4, unit: 'unidades', category: 'Hortifrúti' },
  { id: 'p13', name: 'Aveia em Flocos', quantity: 400, minQuantity: 200, unit: 'g', category: 'Mercearia' },
  { id: 'p14', name: 'Arroz Arbóreo', quantity: 500, minQuantity: 250, unit: 'g', category: 'Mercearia' },
  { id: 'p15', name: 'Queijo Parmesão', quantity: 40, minQuantity: 80, unit: 'g', category: 'Laticínios' },
  { id: 'p16', name: 'Queijo Muçarela', quantity: 400, minQuantity: 200, unit: 'g', category: 'Laticínios' }
];

export const PANTRY_CATEGORIES = [
  'Mercearia',
  'Hortifrúti',
  'Laticínios',
  'Carnes e Frios',
  'Outros'
];
