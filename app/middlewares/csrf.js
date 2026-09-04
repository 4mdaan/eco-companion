// app/middlewares/csrf.js — proteção CSRF (Cross-Site Request Forgery).
//
// Como funciona:
//  1. Geramos um token aleatório e guardamos na sessão do usuário.
//  2. Esse token é enviado em cada formulário (campo oculto _csrf).
//  3. Em requisições que alteram dados (POST), comparamos o token do
//     formulário com o da sessão. Se não baterem, a requisição é
//     rejeitada — bloqueando ações forjadas por outros sites.

const crypto = require("crypto");

function gerarToken() {
  return crypto.randomBytes(24).toString("hex");
}

function csrf(req, res, next) {
  // garante um token na sessão
  if (!req.session.csrfToken) {
    req.session.csrfToken = gerarToken();
  }
  // disponibiliza o token para as views (usado nos formulários)
  res.locals.csrfToken = req.session.csrfToken;

  // métodos que só leem dados não precisam de verificação
  const metodosSeguros = ["GET", "HEAD", "OPTIONS"];
  if (metodosSeguros.includes(req.method)) {
    return next();
  }

  // requisições JSON (fetch) enviam o token no cabeçalho
  const enviado =
    (req.body && req.body._csrf) || req.headers["x-csrf-token"];

  if (enviado && enviado === req.session.csrfToken) {
    return next();
  }

  return res.status(403).render("pages/erro", {
    titulo: "Sessão inválida",
    usuario: req.session.usuario || null,
  });
}

module.exports = csrf;
