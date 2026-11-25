// app/controllers/carrinhoController.js — carrinho, checkout e pedido.

const Carrinho = require("../models/Carrinho");
const Pacote = require("../models/Pacote");
const mercadoPago = require("../services/mercadoPago");

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
    const pedido = Carrinho.criarPendente(sessao.id, "mercado_pago");
    if (!pedido) return res.redirect("/carrinho");

    const itens = JSON.parse(pedido.itens_json);
    const baseUrl = (process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");

    mercadoPago.criarPreferencia({
      pedido,
      usuario: sessao,
      itens,
      baseUrl,
    }).then((preferencia) => {
      const s = require("../../config/database")._getState();
      const armazenado = s.pedidos.find((item) => Number(item.id) === Number(pedido.id));
      if (armazenado) {
        armazenado.mercado_pago_preference_id = preferencia.id;
        require("../../config/database")._save();
      }
      res.redirect(preferencia.init_point);
    }).catch((erro) => {
      console.error("Erro Mercado Pago:", erro.message);
      res.status(503).render("pages/erro", {
        titulo: "Pagamento indisponível",
        cabecalho: "Pagamento não iniciado",
        mensagem: "O Mercado Pago não está configurado ou está temporariamente indisponível. Tente novamente.",
        usuario: sessao,
      });
    });
  },

  async pagamentoSucesso(req, res) {
    const sessao = req.session.usuario;
    const pedidoId = req.query.external_reference;
    const paymentId = req.query.payment_id;
    if (!sessao || !pedidoId) return res.redirect("/conta");

    const pedido = Carrinho.porId(pedidoId);
    if (!pedido || Number(pedido.usuario_id) !== Number(sessao.id)) return res.redirect("/perfil");

    if (paymentId) {
      try {
        const pagamento = await mercadoPago.consultarPagamento(paymentId);
        Carrinho.atualizarPagamentoMercadoPago(pedidoId, {
          paymentId,
          status: pagamento.status,
          paymentType: pagamento.payment_type_id,
        });
      } catch (erro) {
        console.error("Erro ao consultar pagamento aprovado:", erro.message);
      }
    }

    const atualizado = Carrinho.porId(pedidoId);
    const itens = JSON.parse(atualizado.itens_json || "[]");
    res.render("pages/pedido", {
      titulo: atualizado.status === "confirmado" ? "Pedido confirmado" : "Pagamento em análise",
      usuario: sessao,
      pedido: atualizado,
      itens,
      formatBRL,
    });
  },

  pagamentoFalha(req, res) {
    res.render("pages/erro", {
      titulo: "Pagamento não aprovado",
      cabecalho: "Pagamento não aprovado",
      mensagem: "O Mercado Pago não aprovou o pagamento. Nenhuma cobrança foi confirmada.",
      usuario: req.session.usuario || null,
    });
  },

  pagamentoPendente(req, res) {
    res.render("pages/erro", {
      titulo: "Pagamento pendente",
      cabecalho: "Pagamento em análise",
      mensagem: "Seu pagamento está pendente. Ele será confirmado automaticamente após a aprovação.",
      usuario: req.session.usuario || null,
    });
  },

  async webhookMercadoPago(req, res) {
    res.status(200).send("OK");
    if (req.body && req.body.type !== "payment") return;

    const paymentId = req.body.data && req.body.data.id;
    if (!paymentId) return;

    try {
      const pagamento = await mercadoPago.consultarPagamento(paymentId);
      const pedidoId = pagamento.external_reference;
      if (!pedidoId) return;
      Carrinho.atualizarPagamentoMercadoPago(pedidoId, {
        paymentId,
        status: pagamento.status,
        paymentType: pagamento.payment_type_id,
      });
    } catch (erro) {
      console.error("Erro no webhook Mercado Pago:", erro.message);
    }
  },
};

module.exports = carrinhoController;
