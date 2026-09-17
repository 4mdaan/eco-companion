// packages-data.js — fonte única dos pacotes.
// Para adicionar um pacote novo no futuro, copie um bloco abaixo e ajuste os campos.
// O "id" precisa ser único (usado na URL: pacote.html?id=SEU_ID).

window.ECO_PACKAGES = [
  {
    id: "rio",
    image: "assets/rio.jpg",
    title: "Rio de Janeiro",
    nights: "4 dias / 3 noites",
    from: "Saindo de São Paulo",
    score: "8.4",
    stars: 3,
    deal: "Oferta destaque",
    price: "521",
    points: 255,
    art: "linear-gradient(135deg,#1f7a5a,#2fa37a)",
    summary: "Praia, mata e cidade num só roteiro, com hospedagem que trata o próprio esgoto e passeios a pé ou de transporte público.",
    impact: "Hospedagem com tratamento de água próprio e traslados compartilhados.",
    itinerary: [
      "Dia 1 — Chegada, check-in em Botafogo e caminhada pela orla ao pôr do sol.",
      "Dia 2 — Pão de Açúcar e Urca a pé, com guia local da comunidade.",
      "Dia 3 — Trilha leve no Parque da Tijuca e tarde livre em Copacabana.",
      "Dia 4 — Manhã livre e retorno."
    ],
    includes: ["Passagem aérea ida e volta", "3 noites com café da manhã", "Traslado aeroporto compartilhado", "Guia local em 2 passeios"],
    highlights: ["Cristo Redentor e Pão de Açúcar", "Praias de Copacabana e Ipanema", "Trilhas na Floresta da Tijuca"],
    bestTime: "Abril a outubro (clima mais seco)",
    climate: "Tropical, quente o ano todo",
    notIncluded: ["Passeios opcionais", "Refeições além do café da manhã", "Seguro viagem"],
    reviews: [
      { name: "Marina T.", stars: 5, text: "Roteiro impecável e a pousada era linda. Voltarei!" },
      { name: "Carlos R.", stars: 4, text: "Cidade maravilhosa, só achei os deslocamentos um pouco corridos." }
    ]
  },
  {
    id: "maceio",
    image: "assets/maceio.jpg",
    title: "Maceió",
    nights: "8 dias / 7 noites",
    from: "Saindo de São Paulo",
    score: "9.1",
    stars: 2,
    deal: null,
    price: "1.692",
    points: 779,
    art: "linear-gradient(135deg,#14507f,#6ea8d6)",
    summary: "Piscinas naturais e praias calmas, com pousada de energia solar e passeios de jangada que limitam o número de visitantes.",
    impact: "Pousada movida a energia solar e passeios com lotação controlada.",
    itinerary: [
      "Dia 1 — Chegada e descanso na orla de Pajuçara.",
      "Dias 2 a 4 — Piscinas naturais, Praia do Francês e São Miguel dos Milagres.",
      "Dias 5 a 7 — Dias livres para mergulho e cultura local.",
      "Dia 8 — Retorno."
    ],
    includes: ["Passagem aérea ida e volta", "7 noites com café da manhã", "Passeio de jangada às piscinas naturais", "Traslado compartilhado"],
    highlights: ["Piscinas naturais de Pajuçara", "Praia do Francês", "Passeio de jangada"],
    bestTime: "Setembro a março (mar mais calmo)",
    climate: "Tropical litorâneo, sol o ano todo",
    notIncluded: ["Passeios opcionais", "Almoços e jantares", "Taxa de jangada extra"],
    reviews: [
      { name: "Aline C.", stars: 5, text: "As piscinas naturais valem cada centavo. Água cristalina!" },
      { name: "Pedro M.", stars: 5, text: "Pousada com energia solar, atendimento nota 10." }
    ]
  },
  {
    id: "natal",
    image: "assets/natal.jpg",
    title: "Natal",
    nights: "6 dias / 5 noites",
    from: "Saindo de São Paulo",
    score: "7.8",
    stars: 3,
    deal: "Economize R$235",
    price: "1.127",
    points: 511,
    art: "linear-gradient(135deg,#1b6fb3,#7fc4d6)",
    summary: "Dunas, falésias e praias quase desertas, com operadores que usam buggys elétricos onde é permitido.",
    impact: "Operadores com veículos elétricos e respeito às áreas de preservação das dunas.",
    itinerary: [
      "Dia 1 — Chegada e jantar à beira-mar em Ponta Negra.",
      "Dias 2 a 3 — Passeio às dunas de Genipabu e praia de Pipa.",
      "Dias 4 a 5 — Dias livres para descanso e mergulho.",
      "Dia 6 — Retorno."
    ],
    includes: ["Passagem aérea ida e volta", "5 noites com café da manhã", "Passeio às dunas", "Traslado compartilhado"],
    highlights: ["Dunas de Genipabu", "Praia de Pipa", "Passeio de buggy"],
    bestTime: "Setembro a fevereiro",
    climate: "Quente e seco, muito sol",
    notIncluded: ["Buggy opcional", "Refeições", "Seguro viagem"],
    reviews: [
      { name: "Juliana S.", stars: 4, text: "Dunas incríveis. O passeio de buggy é imperdível." },
      { name: "Rafael N.", stars: 5, text: "Praias quase desertas, perfeito para descansar." }
    ]
  },
  {
    id: "sp",
    image: "assets/sp.jpg",
    title: "São Paulo",
    nights: "4 dias / 3 noites",
    from: "Saindo do Rio de Janeiro",
    score: "7.8",
    stars: 3,
    deal: "Oferta destaque",
    price: "611",
    points: 314,
    art: "linear-gradient(135deg,#2a5e86,#8fb8d6)",
    summary: "Cultura, gastronomia e parques urbanos, com hotel bem servido por metrô para você deixar o carro de lado.",
    impact: "Hotel a poucos passos do metrô e roteiro pensado para transporte público.",
    itinerary: [
      "Dia 1 — Chegada e jantar na Vila Madalena.",
      "Dia 2 — Avenida Paulista, MASP e Parque Trianon a pé.",
      "Dia 3 — Mercadão, centro histórico e Pinacoteca.",
      "Dia 4 — Manhã livre e retorno."
    ],
    includes: ["Passagem aérea ida e volta", "3 noites com café da manhã", "Cartão de transporte público recarregado", "Mapa de roteiros a pé"],
    highlights: ["Avenida Paulista e MASP", "Mercadão e centro histórico", "Gastronomia da Vila Madalena"],
    bestTime: "O ano todo",
    climate: "Subtropical, variações ao longo do dia",
    notIncluded: ["Ingressos de museus", "Refeições", "Transporte além do cartão"],
    reviews: [
      { name: "Bruno A.", stars: 4, text: "Ótimo para quem curte cultura e comida boa." },
      { name: "Helena F.", stars: 5, text: "Hotel super bem localizado, tudo perto do metrô." }
    ]
  },
  {
    id: "bonito",
    image: "assets/bonito.jpg",
    title: "Bonito",
    nights: "5 dias / 4 noites",
    from: "Saindo de São Paulo",
    score: "9.4",
    stars: 4,
    deal: "Baixo impacto",
    price: "1.340",
    points: 690,
    art: "linear-gradient(135deg,#1f8a5b,#5fc4a0)",
    summary: "Rios de água cristalina e grutas, num destino que já controla a visitação por padrão para proteger os ecossistemas.",
    impact: "Atrativos com limite diário oficial de visitantes e guias credenciados obrigatórios.",
    itinerary: [
      "Dia 1 — Chegada e adaptação.",
      "Dia 2 — Flutuação no Rio da Prata com guia credenciado.",
      "Dia 3 — Gruta do Lago Azul e trilhas.",
      "Dia 4 — Dia livre para descanso.",
      "Dia 5 — Retorno."
    ],
    includes: ["Passagem aérea ida e volta", "4 noites com café da manhã", "Flutuação guiada", "Ingressos dos atrativos"],
    highlights: ["Flutuação no Rio da Prata", "Gruta do Lago Azul", "Trilhas ecológicas"],
    bestTime: "Março a outubro (água mais clara)",
    climate: "Quente, com chuvas no verão",
    notIncluded: ["Passeios opcionais", "Refeições", "Equipamento de mergulho extra"],
    reviews: [
      { name: "Tiago L.", stars: 5, text: "A flutuação é surreal, parece aquário natural." },
      { name: "Camila P.", stars: 5, text: "Destino que respeita o meio ambiente de verdade." }
    ]
  },
  {
    id: "fernando",
    image: "assets/fernando.jpg",
    title: "Fernando de Noronha",
    nights: "6 dias / 5 noites",
    from: "Saindo do Recife",
    score: "9.6",
    stars: 4,
    deal: null,
    price: "2.980",
    points: 1450,
    art: "linear-gradient(135deg,#0c3a5e,#3a8fb0)",
    summary: "Um dos santuários ecológicos mais protegidos do país, com mergulho, trilhas e taxa de preservação ambiental inclusa.",
    impact: "Taxa de preservação ambiental inclusa e pousada com gestão de resíduos certificada.",
    itinerary: [
      "Dia 1 — Chegada e pôr do sol no Forte.",
      "Dias 2 a 3 — Mergulho e Baía dos Porcos.",
      "Dias 4 a 5 — Trilhas guiadas e praias preservadas.",
      "Dia 6 — Retorno."
    ],
    includes: ["Passagem aérea ida e volta", "5 noites com café da manhã", "Taxa de preservação ambiental", "Mergulho guiado"],
    highlights: ["Baía dos Porcos", "Mergulho com tartarugas", "Mirante dos Dois Irmãos"],
    bestTime: "Agosto a dezembro (mergulho)",
    climate: "Tropical, temperatura estável",
    notIncluded: ["Taxa de mergulho avançado", "Refeições", "Passeios de barco extras"],
    reviews: [
      { name: "Fernanda G.", stars: 5, text: "O paraíso existe e fica em Noronha. Inesquecível." },
      { name: "Lucas D.", stars: 5, text: "Caro, mas vale cada real. Natureza preservada." }
    ]
  },
  {
    id: "gramado",
    image: "assets/gramado.jpg",
    title: "Gramado",
    nights: "4 dias / 3 noites",
    from: "Saindo de São Paulo",
    score: "8.9",
    stars: 3,
    deal: null,
    price: "890",
    points: 432,
    art: "linear-gradient(135deg,#2b6f6f,#7fb8b0)",
    summary: "Clima de serra, parques e gastronomia, com pousada aconchegante e roteiro caminhável pelo centro.",
    impact: "Pousada com reuso de água e roteiro central a pé, sem necessidade de carro.",
    itinerary: [
      "Dia 1 — Chegada e jantar no centro.",
      "Dia 2 — Lago Negro e Mini Mundo a pé.",
      "Dia 3 — Vale dos Vinhedos com transporte compartilhado.",
      "Dia 4 — Manhã livre e retorno."
    ],
    includes: ["Passagem aérea ida e volta", "3 noites com café da manhã", "Tour compartilhado ao Vale dos Vinhedos", "Traslado"],
    highlights: ["Lago Negro", "Vale dos Vinhedos", "Rua Coberta e gastronomia"],
    bestTime: "Junho a agosto (frio) ou dezembro (Natal Luz)",
    climate: "Serra, frio no inverno",
    notIncluded: ["Degustações de vinho", "Refeições", "Ingressos de parques"],
    reviews: [
      { name: "Sandra R.", stars: 5, text: "Clima de serra perfeito, muito aconchegante." },
      { name: "Marcos V.", stars: 4, text: "Lindo no inverno. Leve casaco!" }
    ]
  },
  {
    id: "salvador",
    image: "assets/salvador.jpg",
    title: "Salvador",
    nights: "5 dias / 4 noites",
    from: "Saindo de São Paulo",
    score: "8.2",
    stars: 3,
    deal: "Economize R$180",
    price: "1.050",
    points: 498,
    art: "linear-gradient(135deg,#185f96,#6ea8d6)",
    summary: "História, praia e ritmo, com hospedagem no centro histórico e passeios a pé pelo Pelourinho.",
    impact: "Hospedagem em prédio histórico restaurado e roteiros a pé pelo centro.",
    itinerary: [
      "Dia 1 — Chegada e Pelourinho ao entardecer.",
      "Dia 2 — Cidade Alta e Cidade Baixa pelo Elevador Lacerda.",
      "Dias 3 a 4 — Praias do Porto da Barra e Farol da Barra.",
      "Dia 5 — Retorno."
    ],
    includes: ["Passagem aérea ida e volta", "4 noites com café da manhã", "Tour histórico a pé", "Traslado compartilhado"],
    highlights: ["Pelourinho histórico", "Elevador Lacerda", "Praia do Porto da Barra"],
    bestTime: "Setembro a março",
    climate: "Tropical, quente o ano todo",
    notIncluded: ["Passeios opcionais", "Refeições", "Shows e eventos"],
    reviews: [
      { name: "Patrícia L.", stars: 5, text: "História e cultura em cada esquina. Amei o Pelô." },
      { name: "Diego S.", stars: 4, text: "Cidade vibrante, comida maravilhosa." }
    ]
  }
];

// ---- Helpers de cashback (5% do valor do pacote) ----
window.ECO_CASHBACK_RATE = 0.05;

// "1.692" -> 1692 ; "521" -> 521
window.ecoPriceToNumber = function (priceStr) {
  if (typeof priceStr !== "string") return Number(priceStr) || 0;
  return parseInt(priceStr.replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
};

// valor de cashback de um pacote, em número (ex: 1692 -> 84.6)
window.ecoCashbackOf = function (pkg) {
  if (!pkg) return 0;
  return window.ecoPriceToNumber(pkg.price) * window.ECO_CASHBACK_RATE;
};

// formata número em reais: 84.6 -> "84,60"
window.ecoFormatBRL = function (value) {
  return (Number(value) || 0).toFixed(2).replace(".", ",");
};
