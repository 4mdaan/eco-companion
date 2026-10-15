// tests/csrf.test.js — testes do middleware de proteção CSRF.

const { test, describe } = require("node:test");
const assert = require("node:assert");

const csrf = require("../app/middlewares/csrf");

// helpers para simular req/res do Express
function novaResposta() {
  return {
    locals: {},
    statusCode: 200,
    renderizou: null,
    status(c) { this.statusCode = c; return this; },
    render(view) { this.renderizou = view; return this; },
  };
}

describe("Proteção CSRF", () => {
  test("GET gera um token na sessão", () => {
    const sessao = {};
    const req = { method: "GET", session: sessao, body: {}, headers: {} };
    const res = novaResposta();
    let chamouNext = false;
    csrf(req, res, () => (chamouNext = true));

    assert.ok(chamouNext, "deve chamar next()");
    assert.ok(sessao.csrfToken, "deve criar um token");
    assert.strictEqual(res.locals.csrfToken, sessao.csrfToken, "expõe o token para a view");
  });

  test("POST sem token é bloqueado com 403", () => {
    const sessao = { csrfToken: "token-secreto" };
    const req = { method: "POST", session: sessao, body: {}, headers: {} };
    const res = novaResposta();
    let chamouNext = false;
    csrf(req, res, () => (chamouNext = true));

    assert.ok(!chamouNext, "não deve prosseguir");
    assert.strictEqual(res.statusCode, 403);
  });

  test("POST com token errado é bloqueado", () => {
    const sessao = { csrfToken: "token-certo" };
    const req = { method: "POST", session: sessao, body: { _csrf: "token-errado" }, headers: {} };
    const res = novaResposta();
    let chamouNext = false;
    csrf(req, res, () => (chamouNext = true));

    assert.ok(!chamouNext);
    assert.strictEqual(res.statusCode, 403);
  });

  test("POST com token correto no corpo prossegue", () => {
    const sessao = { csrfToken: "token-certo" };
    const req = { method: "POST", session: sessao, body: { _csrf: "token-certo" }, headers: {} };
    const res = novaResposta();
    let chamouNext = false;
    csrf(req, res, () => (chamouNext = true));

    assert.ok(chamouNext, "deve prosseguir com token válido");
  });

  test("POST com token correto no cabeçalho (fetch) prossegue", () => {
    const sessao = { csrfToken: "token-certo" };
    const req = { method: "POST", session: sessao, body: {}, headers: { "x-csrf-token": "token-certo" } };
    const res = novaResposta();
    let chamouNext = false;
    csrf(req, res, () => (chamouNext = true));

    assert.ok(chamouNext, "aceita token via cabeçalho X-CSRF-Token");
  });
});
