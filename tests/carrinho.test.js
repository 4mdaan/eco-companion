// tests/carrinho.test.js — testes do model do carrinho.
// Executa com: npm test
// Usa o test runner nativo do Node (node:test), sem dependências externas.

const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");

const Carrinho = require("../app/models/Carrinho");

// usuário fictício exclusivo dos testes (id improvável de colidir)
const UID = 999999;

describe("Carrinho de compras", () => {
  beforeEach(() => {
    Carrinho.esvaziar(UID);
  });

  after(() => {
    Carrinho.esvaziar(UID);
  });

  test("começa vazio", () => {
    assert.strictEqual(Carrinho.contar(UID), 0);
    assert.strictEqual(Carrinho.total(UID), 0);
    assert.deepStrictEqual(Carrinho.listar(UID), []);
  });

  test("adiciona um pacote", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "4 noites", preco: 500 });
    assert.strictEqual(Carrinho.contar(UID), 1);
    assert.strictEqual(Carrinho.total(UID), 500);
  });

  test("soma o total de itens diferentes", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    Carrinho.adicionar({ usuarioId: UID, tipo: "voo", refId: "v1", nome: "Voo", meta: "", preco: 300 });
    assert.strictEqual(Carrinho.contar(UID), 2);
    assert.strictEqual(Carrinho.total(UID), 800);
  });

  test("adicionar o mesmo item aumenta a quantidade, não duplica", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    const itens = Carrinho.listar(UID);
    assert.strictEqual(itens.length, 1, "deve haver 1 linha só");
    assert.strictEqual(itens[0].quantidade, 2, "quantidade deve ser 2");
    assert.strictEqual(Carrinho.total(UID), 1000, "total considera a quantidade");
  });

  test("define a quantidade de um item", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    const item = Carrinho.listar(UID)[0];
    Carrinho.definirQuantidade(UID, item.id, 3);
    assert.strictEqual(Carrinho.total(UID), 1500);
  });

  test("definir quantidade 0 remove o item", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    const item = Carrinho.listar(UID)[0];
    Carrinho.definirQuantidade(UID, item.id, 0);
    assert.strictEqual(Carrinho.contar(UID), 0);
  });

  test("remove um item específico", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    Carrinho.adicionar({ usuarioId: UID, tipo: "voo", refId: "v1", nome: "Voo", meta: "", preco: 300 });
    const item = Carrinho.listar(UID).find((i) => i.tipo === "voo");
    Carrinho.remover(UID, item.id);
    assert.strictEqual(Carrinho.contar(UID), 1);
    assert.strictEqual(Carrinho.total(UID), 500);
  });

  test("finalizar cria um pedido e esvazia o carrinho", () => {
    Carrinho.adicionar({ usuarioId: UID, tipo: "pacote", refId: "rio", nome: "Rio", meta: "", preco: 500 });
    Carrinho.adicionar({ usuarioId: UID, tipo: "voo", refId: "v1", nome: "Voo", meta: "", preco: 300 });
    const pedido = Carrinho.finalizar(UID, "cartao");
    assert.ok(pedido, "deve retornar um pedido");
    assert.strictEqual(pedido.total, 800);
    assert.strictEqual(pedido.pagamento, "cartao");
    assert.strictEqual(Carrinho.contar(UID), 0, "carrinho deve esvaziar após finalizar");
  });

  test("finalizar carrinho vazio não cria pedido", () => {
    const pedido = Carrinho.finalizar(UID, "cartao");
    assert.strictEqual(pedido, null);
  });
});
