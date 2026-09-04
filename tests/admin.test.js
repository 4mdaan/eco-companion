// tests/admin.test.js — testes do model Admin e do histórico de pedidos.

const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");

const Carrinho = require("../app/models/Carrinho");
const Admin = require("../app/models/Admin");

const UID = 888888;

function limpa() {
  const db = require("../config/database");
  const s = db._getState();
  s.carrinho = s.carrinho.filter((i) => i.usuario_id !== UID);
  s.pedidos = s.pedidos.filter((i) => i.usuario_id !== UID);
  db._save();
}

describe("Histórico de pedidos do usuário", () => {
  beforeEach(limpa);
  after(limpa);

  test("usuário sem compras tem histórico vazio", () => {
    assert.deepStrictEqual(Carrinho.pedidosDoUsuario(UID), []);
  });

  test("após finalizar, o pedido aparece no histórico", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    Carrinho.finalizar(UID, "cartao");

    const hist = Carrinho.pedidosDoUsuario(UID);
    assert.strictEqual(hist.length, 1);
    assert.strictEqual(hist[0].total, 500);
    assert.ok(Array.isArray(hist[0].itens), "os itens vêm desempacotados");
    assert.strictEqual(hist[0].itens[0].nome, "Rio");
  });

  test("pedidos aparecem do mais recente para o mais antigo", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "voo", refId: "v1", nome: "Voo 1", meta: "", preco: 100 });
    const primeiro = Carrinho.finalizar(UID, "pix");
    Carrinho.adicionar({ usuarioId: UID, tipo: "voo", refId: "v2", nome: "Voo 2", meta: "", preco: 200 });
    const segundo = Carrinho.finalizar(UID, "pix");

    const hist = Carrinho.pedidosDoUsuario(UID);
    assert.strictEqual(hist.length, 2);
    // o mais recente (segundo) deve vir primeiro
    assert.strictEqual(hist[0].id, segundo.id);
    assert.strictEqual(hist[1].id, primeiro.id);
  });
});

describe("Estatísticas do admin", () => {
  beforeEach(limpa);
  after(limpa);

  test("estatísticas retornam os campos esperados", () => {
    const stats = Admin.estatisticas();
    assert.ok("totalUsuarios" in stats);
    assert.ok("totalPedidos" in stats);
    assert.ok("receita" in stats);
    assert.strictEqual(typeof stats.receita, "number");
  });

  test("a receita soma o total dos pedidos", () => {
    const antes = Admin.estatisticas().receita;
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    Carrinho.finalizar(UID, "cartao");
    const depois = Admin.estatisticas().receita;
    assert.strictEqual(depois - antes, 500);
  });

  test("listarPedidos inclui os itens desempacotados", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    Carrinho.finalizar(UID, "cartao");
    const pedidos = Admin.listarPedidos();
    const meu = pedidos.find((p) => p.usuario_id === UID);
    assert.ok(meu, "o pedido deve estar na lista do admin");
    assert.ok(Array.isArray(meu.itens));
  });
});
