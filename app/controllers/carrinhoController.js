// app/controllers/carrinhoController.js — carrinho, checkout e pedido.

const Carrinho = require("../models/Carrinho");
const Pacote = require("../models/Pacote");

function precoNumero(precoStr) {
  return parseInt(String(precoStr).replace(/\./g, "").replace(/[^\d]/g, ""), 10) || 0;
}
function formatBRL(v) {
  return (Number(v) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const carrinhoController = {
  pagina(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");
    const itens = Carrinho.listar(sessao.id);
    res.render("pages/carrinho", {
      titulo: "Carrinho",
      usuario: sessao,
      itens,
      total: Carrinho.total(sessao.id),
      contagem: Carrinho.contar(sessao.id),
      formatBRL,
    });
  },

  adicionarPacote(req, res) {
    const sessao = req.session.usuario;
    // detecta se a requisição veio via fetch (JavaScript) ou form normal
    const viaFetch = req.headers["x-requested-with"] === "fetch";

    if (!sessao) {
      return viaFetch
        ? res.status(401).json({ erro: "Faça login primeiro." })
        : res.redirect("/conta");
    }

    const pkg = Pacote.porId(req.body.id);
    if (pkg) {
      Carrinho.adicionar({
        usuarioId: sessao.id,
        tipo: "pacote",
        refId: pkg.id,
        nome: pkg.title,
        meta: pkg.nights + " · " + pkg.from,
        preco: precoNumero(pkg.price),
      });
    }

    // fetch: responde JSON (fica na página). Form normal: vai ao carrinho.
    if (viaFetch) {
      return res.json({ ok: true, quantidade: Carrinho.contar(sessao.id) });
    }
    res.redirect("/carrinho");
  },

  adicionarVoo(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.status(401).json({ erro: "Faça login primeiro." });
    const { refId, nome, meta, preco } = req.body;
    Carrinho.adicionar({
      usuarioId: sessao.id,
      tipo: "voo",
      refId: refId || "voo-" + Date.now(),
      nome: nome || "Voo",
      meta: meta || "",
      preco: Number(preco) || 0,
    });
    res.json({ ok: true, quantidade: Carrinho.contar(sessao.id) });
  },

  atualizarQuantidade(req, res) {
    const sessao = req.session.usuario;
    const viaFetch = req.headers["x-requested-with"] === "fetch";
    if (!sessao) {
      return viaFetch
        ? res.status(401).json({ erro: "Faça login." })
        : res.redirect("/conta");
    }

    Carrinho.definirQuantidade(sessao.id, req.body.itemId, req.body.quantidade);

    if (viaFetch) {
      const itens = Carrinho.listar(sessao.id);
      const item = itens.find((i) => String(i.id) === String(req.body.itemId));
      return res.json({
        ok: true,
        quantidade: item ? item.quantidade : 0,
        subtotalItem: item ? item.preco * item.quantidade : 0,
        total: Carrinho.total(sessao.id),
        totalItens: itens.length,
        contagem: Carrinho.contar(sessao.id),
        removido: !item,
      });
    }
    res.redirect("/carrinho");
  },

  remover(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");
    Carrinho.remover(sessao.id, req.params.id);
    res.redirect("/carrinho");
  },

  checkout(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");
    const itens = Carrinho.listar(sessao.id);
    if (!itens.length) return res.redirect("/carrinho");
    res.render("pages/checkout", {
      titulo: "Pagamento",
      usuario: sessao,
      itens,
      total: Carrinho.total(sessao.id),
      formatBRL,
      erro: null,
    });
  },

  finalizar(req, res) {
    const sessao = req.session.usuario;
    if (!sessao) return res.redirect("/conta");
    const pagamento = req.body.pagamento === "pix" ? "pix" : "cartao";
    const pedido = Carrinho.finalizar(sessao.id, pagamento);
    if (!pedido) return res.redirect("/carrinho");
    res.render("pages/pedido", {
      titulo: "Pedido confirmado",
      usuario: sessao,
      pedido,
      itens: JSON.parse(pedido.itens_json),
      formatBRL,
    });
  },
};

module.exports = carrinhoController;
