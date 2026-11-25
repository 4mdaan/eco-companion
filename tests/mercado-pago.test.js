const { test, describe } = require("node:test");
const assert = require("node:assert");
const mercadoPago = require("../app/services/mercadoPago");

describe("Mercado Pago", () => {
  test("exige o access token para criar preferência", async () => {
    delete process.env.MP_ACCESS_TOKEN;
    await assert.rejects(
      mercadoPago.criarPreferencia({
        pedido: { id: 1 },
        usuario: { id: 1, nome: "Teste", email: "teste@example.com" },
        itens: [{ ref_id: 1, nome: "Pacote", quantidade: 1, preco: 100 }],
        baseUrl: "https://eco-companion.onrender.com",
      }),
      /Mercado Pago não configurado/
    );
  });

  test("envia itens e external_reference para o Checkout Pro", async () => {
    process.env.MP_ACCESS_TOKEN = "TEST-token";
    const originalFetch = global.fetch;
    global.fetch = async (url, options) => ({
      ok: true,
      json: async () => ({ id: "pref-1", init_point: "https://www.mercadopago.com.br/checkout/v1/redirect" }),
    });

    try {
      const preferencia = await mercadoPago.criarPreferencia({
        pedido: { id:42 },
        usuario: { id: 7, nome: "Daniel", email: "daniel@example.com" },
        itens: [{ ref_id: 3, nome: "Maceió", quantidade: 2, preco: 150 }],
        baseUrl: "https://eco-companion.onrender.com",
      });

      assert.strictEqual(preferencia.id, "pref-1");
      assert.ok(preferencia.init_point);
    } finally {
      global.fetch = originalFetch;
      delete process.env.MP_ACCESS_TOKEN;
    }
  });
});
