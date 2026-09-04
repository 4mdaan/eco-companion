// app/controllers/authController.js — login, cadastro e logout.

const Usuario = require("../models/Usuario");
const validacao = require("../utils/validacao");

function valida({ email, senha }) {
  return validacao.validaCredenciais({ email, senha });
}

const authController = {
  // GET /conta — mostra login/perfil
  paginaConta(req, res) {
    res.render("pages/conta", {
      titulo: "Minha conta",
      usuario: req.session.usuario || null,
      erro: null,
      aba: req.query.aba === "cadastro" ? "cadastro" : "login",
    });
  },

  // POST /entrar
  entrar(req, res) {
    const { email, senha } = req.body;
    const erros = valida({ email, senha });
    if (erros.length) {
      return res.status(400).render("pages/conta", {
        titulo: "Minha conta",
        usuario: null,
        erro: erros[0],
        aba: "login",
      });
    }
    const user = Usuario.autenticar(email, senha);
    if (!user) {
      return res.status(401).render("pages/conta", {
        titulo: "Minha conta",
        usuario: null,
        erro: "E-mail ou senha incorretos.",
        aba: "login",
      });
    }
    req.session.usuario = { id: user.id, nome: user.nome, email: user.email };
    res.redirect("/perfil");
  },

  // POST /cadastrar
  cadastrar(req, res) {
    const { nome, email, senha } = req.body;
    const erros = valida({ email, senha });
    if (!nome || nome.trim().length < 2) erros.push("Informe seu nome.");
    if (Usuario.porEmail(email || "")) erros.push("Este e-mail já está cadastrado.");

    if (erros.length) {
      return res.status(400).render("pages/conta", {
        titulo: "Minha conta",
        usuario: null,
        erro: erros[0],
        aba: "cadastro",
      });
    }
    const user = Usuario.criar({ nome: nome.trim(), email, senha });
    req.session.usuario = { id: user.id, nome: user.nome, email: user.email };
    res.redirect("/perfil");
  },

  // POST /sair
  sair(req, res) {
    req.session.destroy(() => res.redirect("/conta"));
  },
};

module.exports = authController;
