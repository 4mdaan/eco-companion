// tests/validacao.test.js — testes das regras de validação.

const { test, describe } = require("node:test");
const assert = require("node:assert");

const validacao = require("../app/utils/validacao");

describe("Validação de e-mail", () => {
  test("aceita e-mails válidos", () => {
    assert.ok(validacao.emailValido("user@email.com"));
    assert.ok(validacao.emailValido("maria.silva@empresa.com.br"));
  });

  test("rejeita e-mails inválidos", () => {
    assert.ok(!validacao.emailValido(""));
    assert.ok(!validacao.emailValido("semarroba.com"));
    assert.ok(!validacao.emailValido("sem@dominio"));
    assert.ok(!validacao.emailValido("@email.com"));
  });

  test("rejeita e-mail longo demais", () => {
    const longo = "a".repeat(115) + "@x.com";
    assert.ok(!validacao.emailValido(longo));
  });
});

describe("Validação de senha", () => {
  test("aceita senha com letras e números e 8+ caracteres", () => {
    assert.ok(validacao.senhaValida("abc12345"));
    assert.ok(validacao.senhaValida("MinhaSenha1"));
  });

  test("rejeita senha curta", () => {
    assert.ok(!validacao.senhaValida("abc123"));
  });

  test("rejeita senha só com letras", () => {
    assert.ok(!validacao.senhaValida("abcdefgh"));
  });

  test("rejeita senha só com números", () => {
    assert.ok(!validacao.senhaValida("12345678"));
  });
});

describe("Validação de credenciais (conjunto)", () => {
  test("credenciais válidas não geram erros", () => {
    const erros = validacao.validaCredenciais({ email: "a@b.com", senha: "abc12345" });
    assert.strictEqual(erros.length, 0);
  });

  test("credenciais ruins geram erros descritivos", () => {
    const erros = validacao.validaCredenciais({ email: "ruim", senha: "123" });
    assert.ok(erros.length >= 2);
    assert.ok(erros.some((e) => e.includes("e-mail")));
  });
});
