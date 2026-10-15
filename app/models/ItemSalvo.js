// app/models/ItemSalvo.js — pacotes, voos e buscas salvos pelo usuário.

const db = require("../../config/database");

const ItemSalvo = {
  listar(usuarioId, tipo) {
    return db
      .prepare(
        "SELECT * FROM itens_salvos WHERE usuario_id = ? AND tipo = ? ORDER BY criado_em DESC"
      )
      .all(usuarioId, tipo);
  },

  existe(usuarioId, tipo, refId) {
    return db
      .prepare(
        "SELECT id FROM itens_salvos WHERE usuario_id = ? AND tipo = ? AND ref_id = ?"
      )
      .get(usuarioId, tipo, refId);
  },

  adicionar({ usuarioId, tipo, refId, nome, meta, preco = 0 }) {
    db.prepare(
      "INSERT INTO itens_salvos (usuario_id, tipo, ref_id, nome, meta, preco) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(usuarioId, tipo, refId, nome, meta, preco);
  },

  remover(id, usuarioId) {
    const item = db
      .prepare("SELECT * FROM itens_salvos WHERE id = ? AND usuario_id = ?")
      .get(id, usuarioId);
    if (item) {
      db.prepare("DELETE FROM itens_salvos WHERE id = ?").run(id);
    }
    return item;
  },

  removerPorRef(usuarioId, tipo, refId) {
    const item = this.existe(usuarioId, tipo, refId);
    if (item) {
      db.prepare("DELETE FROM itens_salvos WHERE id = ?").run(item.id);
    }
    return item;
  },
};

module.exports = ItemSalvo;
