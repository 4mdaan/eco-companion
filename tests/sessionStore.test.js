// tests/sessionStore.test.js — sessões guardadas em arquivo.

const { test, describe, after } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const FileStore = require("../app/utils/sessionStore");
const arquivo = path.join(os.tmpdir(), "eco-sessoes-teste-" + process.pid + ".json");

describe("Sessões em arquivo", () => {
  after(() => fs.rmSync(arquivo, { force: true }));

  test("a sessão sobrevive a um 'reinício' (novo FileStore, mesmo arquivo)", (t, done) => {
    const a = new FileStore(arquivo);
    a.set("abc", { usuario: { id: 1 }, cookie: {} }, () => {
      const b = new FileStore(arquivo);
      b.get("abc", (err, sess) => {
        assert.strictEqual(sess.usuario.id, 1);
        done();
      });
    });
  });

  test("destroy remove a sessão", (t, done) => {
    const s = new FileStore(arquivo);
    s.set("x1", { cookie: {} }, () => {
      s.destroy("x1", () => {
        s.get("x1", (err, sess) => {
          assert.strictEqual(sess, null);
          done();
        });
      });
    });
  });

  test("sessão expirada não é devolvida", (t, done) => {
    const s = new FileStore(arquivo);
    const ontem = new Date(Date.now() - 86400000).toISOString();
    s.set("velha", { cookie: { expires: ontem } }, () => {
      s.get("velha", (err, sess) => {
        assert.strictEqual(sess, null);
        done();
      });
    });
  });
});
