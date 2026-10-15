// app/models/Usuario.js — operações de usuário no banco.

const db = require("../../config/database");
const bcrypt = require("bcryptjs");

const Usuario = {
  // cria um usuário com senha criptografada
  criar({ nome, email, senha }) {
    const hash = bcrypt.hashSync(senha, 10);
    const stmt = db.prepare(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)"
    );
    const info = stmt.run(nome, email.toLowerCase().trim(), hash);
    return this.porId(info.lastInsertRowid);
  },

  porId(id) {
    return db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id);
  },

  porEmail(email) {
    return db
      .prepare("SELECT * FROM usuarios WHERE email = ?")
      .get(email.toLowerCase().trim());
  },

  // verifica e-mail + senha; retorna o usuário ou null
  autenticar(email, senha) {
    const user = this.porEmail(email);
    if (!user) return null;
    const ok = bcrypt.compareSync(senha, user.senha_hash);
    return ok ? user : null;
  },

  atualizarPerfil(id, { nome, cidade, estilo }) {
    db.prepare(
      "UPDATE usuarios SET nome = ?, cidade = ?, estilo = ? WHERE id = ?"
    ).run(nome, cidade, estilo, id);
    return this.porId(id);
  },

  ajustarSaldo(id, { pontos = 0, cashback = 0 }) {
    db.prepare(
      "UPDATE usuarios SET pontos = MAX(0, pontos + ?), cashback = MAX(0, cashback + ?) WHERE id = ?"
    ).run(pontos, cashback, id);
    return this.porId(id);
  },

  zerarCashback(id) {
    const user = this.porId(id);
    db.prepare("UPDATE usuarios SET cashback = 0 WHERE id = ?").run(id);
    return user ? user.cashback : 0;
  },
};

module.exports = Usuario;
