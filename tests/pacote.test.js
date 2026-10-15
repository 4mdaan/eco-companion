// tests/pacote.test.js — testes do CRUD de pacotes.

const { test, describe, after } = require("node:test");
const assert = require("node:assert");

const Pacote = require("../app/models/Pacote");

// guarda os ids criados nos testes para limpar depois
const criados = [];

after(() => {
  criados.forEach((id) => Pacote.excluir(id));
});

describe("CRUD de pacotes", () => {
  test("listar retorna os pacotes migrados", () => {
    const lista = Pacote.listar();
    assert.ok(Array.isArray(lista));
    assert.ok(lista.length >= 8, "deve ter ao menos os 8 pacotes iniciais");
  });

  test("porId encontra um pacote existente", () => {
    const rio = Pacote.porId("rio");
    assert.ok(rio);
    assert.strictEqual(rio.title, "Rio de Janeiro");
  });

  test("criar gera um id a partir do título", () => {
    const p = Pacote.criar({ title: "Serra Gaúcha Teste", price: "800" });
    criados.push(p.id);
    assert.strictEqual(p.id, "serra-gaucha-teste");
    assert.strictEqual(p.price, "800");
  });

  test("criar dois pacotes com o mesmo título gera ids diferentes", () => {
    const a = Pacote.criar({ title: "Praia Teste", price: "100" });
    const b = Pacote.criar({ title: "Praia Teste", price: "200" });
    criados.push(a.id, b.id);
    assert.notStrictEqual(a.id, b.id);
  });

  test("atualizar altera só os campos enviados", () => {
    const p = Pacote.criar({ title: "Cidade Teste", price: "300", summary: "resumo antigo" });
    criados.push(p.id);
    Pacote.atualizar(p.id, { price: "350" });
    const atualizado = Pacote.porId(p.id);
    assert.strictEqual(atualizado.price, "350", "preço mudou");
    assert.strictEqual(atualizado.summary, "resumo antigo", "resumo foi preservado");
  });

  test("atualizar converte listas de texto em array", () => {
    const p = Pacote.criar({ title: "Roteiro Teste", price: "400" });
    criados.push(p.id);
    Pacote.atualizar(p.id, { includes: "Item 1\nItem 2\nItem 3" });
    const atualizado = Pacote.porId(p.id);
    assert.deepStrictEqual(atualizado.includes, ["Item 1", "Item 2", "Item 3"]);
  });

  test("excluir remove o pacote", () => {
    const p = Pacote.criar({ title: "Excluir Teste", price: "500" });
    const removeu = Pacote.excluir(p.id);
    assert.strictEqual(removeu, true);
    assert.strictEqual(Pacote.porId(p.id), undefined);
  });

  test("excluir um id inexistente retorna false", () => {
    assert.strictEqual(Pacote.excluir("nao-existe-xyz"), false);
  });
});
