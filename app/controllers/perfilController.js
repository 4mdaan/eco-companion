// app/controllers/perfilController.js — perfil, itens salvos e cashback.

const Usuario = require("../models/Usuario");
const ItemSalvo = require("../models/ItemSalvo");
const Carrinho = require("../models/Carrinho");

function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const perfilController = {
  // GET /perfil
  pagina(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");

    const user = Usuario.porId(sessao.id);
    if (!user) {
      req.session.destroy(() => res.redirect("/conta"));
      return;
    }

    res.render("pages/perfil", {
      titulo: "Meu perfil",
      usuario: user,
      pacotes: ItemSalvo.listar(user.id, "pacote"),
      voos: ItemSalvo.listar(user.id, "voo"),
      buscas: ItemSalvo.listar(user.id, "busca"),
      pedidos: Carrinho.pedidosDoUsuario(user.id),
      formatBRL,
      status: req.query.status || null,
    });
  },

  // POST /perfil — atualizar dados
  atualizar(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");

    const { nome, cidade, estilo } = req.body;
    if (!nome || nome.trim().length < 2) {
      return res.redirect("/perfil?status=erro");
    }
    Usuario.atualizarPerfil(sessao.id, {
      nome: nome.trim(),
      cidade: (cidade || "").trim(),
      estilo: estilo || "praia",
    });
    req.session.usuario.nome = nome.trim();
    res.redirect("/perfil?status=salvo");
  },

  // POST /salvar — salvar pacote ou voo (recebe JSON do front)
  salvar(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.status(401).json({ erro: "Faça login primeiro." });

    const { tipo, refId, nome, meta, preco, pontos } = req.body;
    if (!["pacote", "voo", "busca"].includes(tipo)) {
      return res.status(400).json({ erro: "Tipo inválido." });
    }

    const jaExiste = ItemSalvo.existe(sessao.id, tipo, refId);
    const taxaCashback = 0.05;
    const valor = Number(preco) || 0;

    if (jaExiste) {
      ItemSalvo.removerPorRef(sessao.id, tipo, refId);
      if (tipo !== "busca") {
        Usuario.ajustarSaldo(sessao.id, {
          pontos: -(Number(pontos) || 0),
          cashback: -(valor * taxaCashback),
        });
      }
    } else {
      ItemSalvo.adicionar({ usuarioId: sessao.id, tipo, refId, nome, meta, preco: valor });
      if (tipo !== "busca") {
        Usuario.ajustarSaldo(sessao.id, {
          pontos: Number(pontos) || 0,
          cashback: valor * taxaCashback,
        });
      }
    }

    const user = Usuario.porId(sessao.id);
    res.json({
      salvo: !jaExiste,
      pontos: user.pontos,
      cashback: user.cashback,
    });
  },

  // POST /perfil/remover/:id
  remover(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");

    const item = ItemSalvo.remover(req.params.id, sessao.id);
    if (item && item.tipo !== "busca") {
      Usuario.ajustarSaldo(sessao.id, { cashback: -(item.preco * 0.05) });
    }
    res.redirect("/perfil");
  },

  // POST /perfil/resgatar
  resgatar(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");
    Usuario.zerarCashback(sessao.id);
    res.redirect("/perfil?status=resgatado");
  },

  // POST /salvar-pacote — botão "Reservar" salva o pacote no perfil
  reservarPacote(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");

    const Pacote = require("../models/Pacote");
    const pkg = Pacote.porId(req.body.id);
    if (!pkg) return res.redirect("/perfil");

    if (!ItemSalvo.existe(sessao.id, "pacote", pkg.id)) {
      const valor = parseInt(String(pkg.price).replace(/\./g, ""), 10) || 0;
      ItemSalvo.adicionar({
        usuarioId: sessao.id,
        tipo: "pacote",
        refId: pkg.id,
        nome: pkg.title,
        meta: pkg.nights + " · R$ " + pkg.price,
        preco: valor,
      });
      Usuario.ajustarSaldo(sessao.id, { pontos: pkg.points || 0, cashback: valor * 0.05 });
    }
    res.redirect("/perfil");
  },
};

module.exports = perfilController;
