// tests/tratarErros.test.js — testes do wrapper de tratamento de erros.

const { test, describe } = require("node:test");
const assert = require("node:assert");

const tratarErros = require("../app/utils/tratarErros");

describe("Tratamento de erros nos controllers", () => {
  test("um controller normal executa sem interferência", () => {
    let executou = false;
    const envolvido = tratarErros(function (req, res) {
      executou = true;
    });
    envolvido({}, {}, () => {});
    assert.ok(executou, "o controller deve rodar normalmente");
  });

  test("um erro síncrono é encaminhado para next()", () => {
    let erroRecebido = null;
    const envolvido = tratarErros(function () {
      throw new Error("erro de teste");
    });
    envolvido({}, {}, (e) => (erroRecebido = e));
    assert.ok(erroRecebido, "o erro deve ir para o next");
    assert.strictEqual(erroRecebido.message, "erro de teste");
  });

  test("um erro assíncrono (Promise) também é encaminhado", async () => {
    let erroRecebido = null;
    const envolvido = tratarErros(async function () {
      throw new Error("erro assíncrono");
    });
    await envolvido({}, {}, (e) => (erroRecebido = e));
    // pequena espera para a Promise rejeitar
    await new Promise((r) => setTimeout(r, 10));
    assert.ok(erroRecebido, "o erro assíncrono deve ir para o next");
  });
});
