const API_URL = "https://api.mercadopago.com";

function accessToken() {
  return process.env.MP_ACCESS_TOKEN || "";
}

async function criarPreferencia({ pedido, usuario, itens, baseUrl }) {
  const token = accessToken();
  if (!token) throw new Error("Mercado Pago não configurado.");

  const payload = {
    items: itens.map((item) => ({
      id: String(item.ref_id),
      title: item.nome,
      quantity: Number(item.quantidade || 1),
      currency_id: "BRL",
      unit_price: Number(item.preco),
    })),
    payer: {
      name: usuario.nome,
      email: usuario.email,
    },
    external_reference: String(pedido.id),
    back_urls: {
      success: `${baseUrl}/pagamento/sucesso`,
      failure: `${baseUrl}/pagamento/falha`,
      pending: `${baseUrl}/pagamento/pendente`,
    },
    notification_url: `${baseUrl}/webhooks/mercadopago`,
    metadata: {
      eco_companion_pedido_id: pedido.id,
      eco_companion_usuario_id: usuario.id,
    },
  };

  const response = await fetch(`${API_URL}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const mensagem = body.message || body.error || "Não foi possível iniciar o pagamento.";
    throw new Error(mensagem);
  }
  if (!body.id || !body.init_point) {
    throw new Error("Resposta inválida do Mercado Pago.");
  }
  return body;
}

async function consultarPagamento(paymentId) {
  const token = accessToken();
  if (!token) throw new Error("Mercado Pago não configurado.");

  const response = await fetch(`${API_URL}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || "Não foi possível consultar o pagamento.");
  }
  return body;
}

module.exports = { criarPreferencia, consultarPagamento };
