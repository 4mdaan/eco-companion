// app/models/Pacote.js — CRUD de pacotes, persistido no banco (JSON).

const db = require("../../config/database");

function state() {
  return db._getState();
}

// gera um id a partir do título (ex.: "Serra Gaúcha" -> "serra-gaucha")
function gerarId(titulo) {
  return String(titulo || "pacote")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "pacote";
}

const Pacote = {
  listar() {
    return state().pacotes;
  },

  porId(id) {
    return state().pacotes.find((p) => p.id === id);
  },

  // cria um pacote novo com valores padrão para os campos não informados
  criar(dados) {
    const s = state();
    let id = gerarId(dados.title);
    // garante id único
    let n = 2;
    while (s.pacotes.some((p) => p.id === id)) {
      id = gerarId(dados.title) + "-" + n++;
    }

    const novo = {
      id,
      image: dados.image || "assets/rio.jpg",
      title: dados.title || "Novo pacote",
      nights: dados.nights || "3 dias / 2 noites",
      from: dados.from || "Saindo de São Paulo",
      score: dados.score || "8.0",
      stars: Number(dados.stars) || 3,
      deal: dados.deal || "",
      price: String(dados.price || "0"),
      points: Number(dados.points) || 0,
      art: dados.art || "linear-gradient(135deg,#1f7a5a,#2fa37a)",
      summary: dados.summary || "",
      impact: dados.impact || "",
      itinerary: dados.itinerary || [],
      includes: dados.includes || [],
      highlights: dados.highlights || [],
      bestTime: dados.bestTime || "",
      climate: dados.climate || "",
      notIncluded: dados.notIncluded || [],
      reviews: dados.reviews || [],
    };
    s.pacotes.push(novo);
    db._save();
    return novo;
  },

  // atualiza apenas os campos enviados, preservando o resto
  atualizar(id, dados) {
    const pacote = this.porId(id);
    if (!pacote) return null;

    const camposTexto = ["title", "nights", "from", "score", "deal", "price", "summary", "impact", "bestTime", "climate", "image", "art"];
    camposTexto.forEach((campo) => {
      if (dados[campo] !== undefined) pacote[campo] = dados[campo];
    });
    if (dados.stars !== undefined) pacote.stars = Number(dados.stars) || pacote.stars;
    if (dados.points !== undefined) pacote.points = Number(dados.points) || 0;

    // listas: recebidas como texto com uma linha por item
    const listas = ["itinerary", "includes", "highlights", "notIncluded"];
    listas.forEach((campo) => {
      if (dados[campo] !== undefined) {
        pacote[campo] = String(dados[campo])
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
      }
    });

    db._save();
    return pacote;
  },

  excluir(id) {
    const s = state();
    const antes = s.pacotes.length;
    s.pacotes = s.pacotes.filter((p) => p.id !== id);
    const removeu = s.pacotes.length !== antes;
    if (removeu) db._save();
    return removeu;
  },
};

module.exports = Pacote;
