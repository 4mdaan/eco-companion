// tests/database-sync.test.js — o banco recarrega quando o arquivo muda por fora
// (ex.: scripts/tornar-admin.js rodando com o servidor ligado).

const { test, describe, after } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const db = require("../config/database");
const ARQUIVO = path.join(__dirname, "..", "eco-companion-data.json");
const ID = 777001;

function removeTeste() {
  const s = db._getState();
  s.usuarios = s.usuarios.filter((u) => u.id !== ID);
  db._save();
}

describe("Sincronização do banco com o arquivo", () => {
  after(removeTeste);

  test("alteração feita por outro processo é percebida sem reiniciar", () => {
    db._getState(); // garante o arquivo criado
    const dados = JSON.parse(fs.readFileSync(ARQUIVO, "utf8"));
    dados.usuarios.push({ id: ID, nome: "Externo", email: "externo-teste@x.com", senha_hash: "x", admin: true });
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));

    const visto = db._getState().usuarios.find((u) => u.id === ID);
    assert.ok(visto, "o usuário adicionado por fora deve aparecer");
    assert.strictEqual(visto.admin, true);
  });

  test("salvar depois não apaga a alteração externa", () => {
    db._save();
    const dados = JSON.parse(fs.readFileSync(ARQUIVO, "utf8"));
    assert.ok(dados.usuarios.find((u) => u.id === ID), "continua no arquivo");
  });
});
