// app/middlewares/soAdmin.js — restringe rotas ao administrador.
//
// Segurança: em vez de confiar num "admin" guardado na sessão (que
// poderia ficar desatualizado), consultamos o banco a cada acesso e
// verificamos o campo admin do usuário. Se não for admin, bloqueia.

const Usuario = require("../models/Usuario");

function soAdmin(req, res, next) {
  const sessao = req.session.usuario;

  // não está logado → vai para o login
  if (!sessao) {
    return res.redirect("/conta");
  }

  const user = Usuario.porId(sessao.id);

  // logado mas não é admin → 403 (acesso proibido)
  if (!user || !user.admin) {
    return res.status(403).render("pages/erro", {
      titulo: "Acesso restrito",
      usuario: sessao,
    });
  }

  next();
}

module.exports = soAdmin;
