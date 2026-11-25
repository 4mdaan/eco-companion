// routes/index.js — todas as rotas da aplicação.

const express = require("express");
const router = express.Router();

const pages = require("../app/controllers/pagesController");
const auth = require("../app/controllers/authController");
const perfil = require("../app/controllers/perfilController");
const carrinho = require("../app/controllers/carrinhoController");
const admin = require("../app/controllers/adminController");
const soAdmin = require("../app/middlewares/soAdmin");
const tratarErros = require("../app/utils/tratarErros");

// envolve cada método de um controller com o tratamento de erros,
// para que qualquer falha vá ao tratador global em vez de derrubar o app
function seguro(controller) {
  const envolvido = {};
  for (const chave of Object.keys(controller)) {
    const valor = controller[chave];
    envolvido[chave] = typeof valor === "function" ? tratarErros(valor.bind(controller)) : valor;
  }
  return envolvido;
}

const P = seguro(pages);
const A = seguro(auth);
const Pf = seguro(perfil);
const C = seguro(carrinho);
const Ad = seguro(admin);

// páginas de conteúdo
router.get("/", P.home);
router.get("/passagens", P.passagens);
router.get("/pacote/:id", P.pacote);
router.get("/ajuda", P.ajuda);
router.get("/privacidade", pages.legal("privacidade", "Privacidade"));
router.get("/termos", pages.legal("termos", "Termos de uso"));
router.get("/seguranca", pages.legal("seguranca", "Segurança"));

// autenticação
router.get("/conta", A.paginaConta);
router.post("/entrar", A.entrar);
router.post("/cadastrar", A.cadastrar);
router.post("/sair", A.sair);

// perfil (exige login)
router.get("/perfil", Pf.pagina);
router.post("/perfil", Pf.atualizar);
router.post("/perfil/remover/:id", Pf.remover);
router.post("/perfil/resgatar", Pf.resgatar);

// API usada pelo front (salvar pacote/voo via fetch)
router.post("/salvar", Pf.salvar);

// salvar pacote pelo botão "Reservar" (formulário)
router.post("/salvar-pacote", Pf.reservarPacote);

// carrinho de compras
router.get("/carrinho", C.pagina);
router.post("/carrinho/adicionar-pacote", C.adicionarPacote);
router.post("/carrinho/adicionar-voo", C.adicionarVoo);
router.post("/carrinho/quantidade", C.atualizarQuantidade);
router.post("/carrinho/remover/:id", C.remover);
router.get("/checkout", C.checkout);
router.post("/checkout", C.finalizar);

// painel administrativo (todas protegidas pelo middleware soAdmin)
router.get("/admin", soAdmin, Ad.painel);
router.get("/admin/pedidos", soAdmin, Ad.pedidos);
router.get("/admin/usuarios", soAdmin, Ad.usuarios);
router.get("/admin/pacotes", soAdmin, Ad.pacotes);
router.get("/admin/pacotes/novo", soAdmin, Ad.novoPacote);
router.post("/admin/pacotes/novo", soAdmin, Ad.criarPacote);
router.get("/admin/pacotes/:id/editar", soAdmin, Ad.editarPacote);
router.post("/admin/pacotes/:id/editar", soAdmin, Ad.atualizarPacote);
router.post("/admin/pacotes/:id/excluir", soAdmin, Ad.excluirPacote);

module.exports = router;
