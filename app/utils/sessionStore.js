// app/utils/sessionStore.js — guarda as sessões num arquivo JSON.
//
// O armazenamento padrão do express-session fica só na memória: toda vez
// que o servidor reinicia, todo mundo é deslogado. Guardando num arquivo,
// o login sobrevive ao reinício do servidor.

const fs = require("fs");
const session = require("express-session");

class FileStore extends session.Store {
  constructor(arquivo) {
    super();
    this.arquivo = arquivo;
    this.dados = this._ler();
    this._limparExpiradas();
  }

  _ler() {
    try {
      return JSON.parse(fs.readFileSync(this.arquivo, "utf8"));
    } catch (e) {
      return {};
    }
  }

  _gravar() {
    try {
      const tmp = this.arquivo + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(this.dados));
      fs.renameSync(tmp, this.arquivo);
    } catch (e) {
      console.error("Erro ao salvar as sessões:", e.message);
    }
  }

  _expirou(sess) {
    return !!(sess && sess.cookie && sess.cookie.expires && new Date(sess.cookie.expires) < new Date());
  }

  _limparExpiradas() {
    let mudou = false;
    for (const sid of Object.keys(this.dados)) {
      if (this._expirou(this.dados[sid])) {
        delete this.dados[sid];
        mudou = true;
      }
    }
    if (mudou) this._gravar();
  }

  get(sid, cb) {
    const sess = this.dados[sid];
    if (!sess) return cb(null, null);
    if (this._expirou(sess)) {
      delete this.dados[sid];
      this._gravar();
      return cb(null, null);
    }
    cb(null, sess);
  }

  set(sid, sess, cb) {
    this.dados[sid] = JSON.parse(JSON.stringify(sess));
    this._gravar();
    if (cb) cb(null);
  }

  destroy(sid, cb) {
    delete this.dados[sid];
    this._gravar();
    if (cb) cb(null);
  }
}

module.exports = FileStore;
