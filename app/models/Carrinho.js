// app/models/Carrinho.js — itens do carrinho e criação de pedidos.

const db = require("../../config/database");

function state() {
  return db._getState();
}
function proximoId(lista) {
  return lista.reduce((max, it) => Math.max(max, Number(it.id || 0)), 0) + 1;
}

const Carrinho = {
  listar(usuarioId) {
    return state()
      .carrinho.filter((i) => i.usuario_id === Number(usuarioId))
      .sort((a, b) => (b.criado_em || "").localeCompare(a.criado_em || ""));
  },

  contar(usuarioId) {
    return this.listar(usuarioId).reduce((total, i) => total + Number(i.quantidade || 1), 0);
  },

  total(usuarioId) {
    return this.listar(usuarioId).reduce(
      (soma, i) => soma + Number(i.preco) * Number(i.quantidade || 1),
      0
    );
  },

  achar(usuarioId, tipo, refId) {
    return state().carrinho.find(
      (i) => i.usuario_id === Number(usuarioId) && i.tipo === tipo && i.ref_id === refId
    );
  },

  adicionar({ usuarioId, tipo, refId, nome, meta, preco }) {
    const existente = this.achar(usuarioId, tipo, refId);
    if (existente) {
      existente.quantidade = Number(existente.quantidade || 1) + 1;
    } else {
      state().carrinho.push({
        id: proximoId(state().carrinho),
        usuario_id: Number(usuarioId),
        tipo,
        ref_id: refId,
        nome,
        meta: meta || "",
        preco: Number(preco) || 0,
        quantidade: 1,
        criado_em: new Date().toISOString(),
      });
    }
    db._save();
  },

  definirQuantidade(usuarioId, itemId, quantidade) {
    const item = state().carrinho.find(
      (i) => i.id === Number(itemId) && i.usuario_id === Number(usuarioId)
    );
    if (!item) return;
    const q = Number(quantidade);
    if (q <= 0) {
      this.remover(usuarioId, itemId);
    } else {
      item.quantidade = q;
      db._save();
    }
  },

  remover(usuarioId, itemId) {
    const s = state();
    const antes = s.carrinho.length;
    s.carrinho = s.carrinho.filter(
      (i) => !(i.id === Number(itemId) && i.usuario_id === Number(usuarioId))
    );
    if (s.carrinho.length !== antes) db._save();
  },

  esvaziar(usuarioId) {
    const s = state();
    s.carrinho = s.carrinho.filter((i) => i.usuario_id !== Number(usuarioId));
    db._save();
  },

  finalizar(usuarioId, pagamento) {
    const itens = this.listar(usuarioId);
    if (!itens.length) return null;
    const total = this.total(usuarioId);
    const s = state();
    const pedido = {
      id: proximoId(s.pedidos),
      usuario_id: Number(usuarioId),
      total,
      itens_json: JSON.stringify(itens),
      pagamento,
      status: "confirmado",
      criado_em: new Date().toISOString(),
    };
    s.pedidos.push(pedido);
    this.esvaziar(usuarioId);
    db._save();
    return pedido;
  },
  // lista os pedidos de um usuário (histórico), do mais recente ao mais antigo
  pedidosDoUsuario(usuarioId) {
    return db
      ._getState()
      .pedidos.filter((p) => Number(p.usuario_id) === Number(usuarioId))
      .sort((a, b) => {
        const data = (b.criado_em || "").localeCompare(a.criado_em || "");
        return data !== 0 ? data : Number(b.id) - Number(a.id);
      })
      .map((p) => {
        let itens = [];
        try {
          itens = JSON.parse(p.itens_json || "[]");
        } catch (e) {}
        return { ...p, itens };
      });
  },
};

module.exports = Carrinho;
