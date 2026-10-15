// app/controllers/adminController.js — painel administrativo.

const Admin = require("../models/Admin");
const Pacote = require("../models/Pacote");

function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const adminController = {
  // GET /admin — visão geral
  painel(req, res) {
    res.render("pages/admin/painel", {
      titulo: "Painel administrativo",
      usuario: req.session.usuario,
      stats: Admin.estatisticas(),
      formatBRL,
    });
  },

  // GET /admin/pedidos
  pedidos(req, res) {
    res.render("pages/admin/pedidos", {
      titulo: "Pedidos",
      usuario: req.session.usuario,
      pedidos: Admin.listarPedidos(),
      formatBRL,
    });
  },

  // GET /admin/usuarios
  usuarios(req, res) {
    res.render("pages/admin/usuarios", {
      titulo: "Usuários",
      usuario: req.session.usuario,
      usuarios: Admin.listarUsuarios(),
    });
  },

  // GET /admin/pacotes
  pacotes(req, res) {
    res.render("pages/admin/pacotes", {
      titulo: "Pacotes",
      usuario: req.session.usuario,
      pacotes: Pacote.listar(),
      status: req.query.status || null,
    });
  },

  // GET /admin/pacotes/novo — formulário de criação
  novoPacote(req, res) {
    res.render("pages/admin/pacote-form", {
      titulo: "Novo pacote",
      usuario: req.session.usuario,
      pacote: null, // null = criação
    });
  },

  // GET /admin/pacotes/:id/editar — formulário de edição
  editarPacote(req, res) {
    const pacote = Pacote.porId(req.params.id);
    if (!pacote) return res.redirect("/admin/pacotes?status=nao-encontrado");
    res.render("pages/admin/pacote-form", {
      titulo: "Editar pacote",
      usuario: req.session.usuario,
      pacote,
    });
  },

  // POST /admin/pacotes/novo — cria
  criarPacote(req, res) {
    const b = req.body;
    Pacote.criar({
      title: b.title,
      price: b.price,
      nights: b.nights,
      from: b.from,
      score: b.score,
      stars: b.stars,
      points: b.points,
      deal: b.deal,
      summary: b.summary,
      impact: b.impact,
      bestTime: b.bestTime,
      climate: b.climate,
      image: b.image,
      itinerary: (b.itinerary || "").split("\n").map((l) => l.trim()).filter(Boolean),
      includes: (b.includes || "").split("\n").map((l) => l.trim()).filter(Boolean),
      highlights: (b.highlights || "").split("\n").map((l) => l.trim()).filter(Boolean),
      notIncluded: (b.notIncluded || "").split("\n").map((l) => l.trim()).filter(Boolean),
    });
    res.redirect("/admin/pacotes?status=criado");
  },

  // POST /admin/pacotes/:id/editar — atualiza
  atualizarPacote(req, res) {
    const ok = Pacote.atualizar(req.params.id, req.body);
    res.redirect("/admin/pacotes?status=" + (ok ? "atualizado" : "nao-encontrado"));
  },

  // POST /admin/pacotes/:id/excluir — remove
  excluirPacote(req, res) {
    Pacote.excluir(req.params.id);
    res.redirect("/admin/pacotes?status=excluido");
  },
};

module.exports = adminController;
