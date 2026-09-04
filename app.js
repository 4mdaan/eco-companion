// app.js — ponto de entrada do servidor Eco Companion.
// Configura o Express, segurança, sessões, rotas e tratamento de erros.

require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const rotas = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;
const EM_PRODUCAO = process.env.NODE_ENV === "production";

// ------------------------------------------------------------------
// Segurança: Helmet adiciona cabeçalhos HTTP que protegem contra
// ataques comuns (clickjacking, sniffing de MIME, etc.).
// A Content-Security-Policy permite as fontes do Google Fonts usadas.
// ------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// arquivos estáticos (css, img, js do front)
app.use(express.static(path.join(__dirname, "public")));

// body parsers (formulários e JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------------------------------------------------------
// Sessões. O cookie usa flags de segurança:
//  - httpOnly: o cookie não pode ser lido por JavaScript (protege
//    contra roubo de sessão via XSS).
//  - sameSite "lax": ajuda a proteger contra CSRF.
//  - secure: em produção (HTTPS), o cookie só trafega criptografado.
// ------------------------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "eco-companion-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      httpOnly: true,
      sameSite: "lax",
      secure: EM_PRODUCAO,
    },
  })
);

// ------------------------------------------------------------------
// Rate limiting: limita tentativas de login/cadastro para dificultar
// ataques de força bruta. Máximo de 10 tentativas por IP a cada 15 min.
// ------------------------------------------------------------------
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
});
app.use("/entrar", limiteLogin);
app.use("/cadastrar", limiteLogin);

// deixa o usuário logado e a contagem do carrinho disponíveis nas views
app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuario || null;
  let qtdCarrinho = 0;
  let isAdmin = false;
  if (req.session.usuario) {
    try {
      const Carrinho = require("./app/models/Carrinho");
      qtdCarrinho = Carrinho.contar(req.session.usuario.id);
      const Usuario = require("./app/models/Usuario");
      const u = Usuario.porId(req.session.usuario.id);
      isAdmin = !!(u && u.admin);
    } catch (e) {}
  }
  res.locals.qtdCarrinho = qtdCarrinho;
  res.locals.isAdmin = isAdmin;
  next();
});

// proteção CSRF em todos os formulários que alteram dados
const csrf = require("./app/middlewares/csrf");
app.use(csrf);

// rotas
app.use("/", rotas);

// 404 — página não encontrada
app.use((req, res) => {
  res.status(404).render("pages/404", {
    titulo: "Não encontrado",
    usuario: req.session.usuario || null,
  });
});

// ------------------------------------------------------------------
// Tratador de erros global: qualquer erro não capturado cai aqui,
// evitando que o servidor quebre ou exponha detalhes internos.
// ------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("Erro na aplicação:", err.message);
  res.status(500).render("pages/erro", {
    titulo: "Erro",
    usuario: req.session.usuario || null,
  });
});

app.listen(PORT, () => {
  console.log(`Eco Companion rodando em http://localhost:${PORT}`);
});
