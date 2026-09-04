// app/controllers/pagesController.js — páginas de conteúdo.

const Pacote = require("../models/Pacote");

const pagesController = {
  home(req, res) {
    res.render("pages/home", { titulo: "Início", usuario: req.session.usuario || null, pacotes: Pacote.listar() });
  },

  passagens(req, res) {
    res.render("pages/passagens", { titulo: "Passagens", usuario: req.session.usuario || null });
  },

  pacote(req, res) {
    const pacote = Pacote.porId(req.params.id);
    if (!pacote) {
      return res.status(404).render("pages/404", { titulo: "Não encontrado", usuario: req.session.usuario || null });
    }
    res.render("pages/pacote", { titulo: pacote.title, usuario: req.session.usuario || null, pacote });
  },

  ajuda(req, res) {
    res.render("pages/ajuda", { titulo: "Ajuda", usuario: req.session.usuario || null });
  },

  legal(view, titulo) {
    return (req, res) =>
      res.render("pages/" + view, { titulo, usuario: req.session.usuario || null });
  },
};

module.exports = pagesController;
