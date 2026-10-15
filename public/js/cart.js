// cart.js — controle de quantidade do carrinho.
// Os botões + e − atualizam a quantidade via fetch e recalculam
// os totais na hora, sem recarregar a página.

(function () {
  "use strict";

  function csrfToken() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute("content") : "";
  }

  function brl(v) {
    return (Number(v) || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function atualizarBadge(qtd) {
    var cart = document.querySelector(".topbar-cart");
    if (!cart) return;
    var badge = cart.querySelector(".cart-count");
    if (!badge && qtd > 0) {
      badge = document.createElement("span");
      badge.className = "cart-count";
      cart.appendChild(badge);
    }
    if (badge) badge.textContent = qtd;
  }

  document.querySelectorAll(".cart-qty").forEach(function (grupo) {
    var itemId = grupo.getAttribute("data-item");
    var valorEl = grupo.querySelector(".cart-qty-value");

    grupo.querySelectorAll(".cart-qty-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var atual = parseInt(valorEl.textContent, 10) || 1;
        var delta = parseInt(btn.getAttribute("data-delta"), 10);
        var nova = atual + delta;
        if (nova < 1) nova = 1;   // não deixa passar de 1 pelos botões
        if (nova > 99) nova = 99;
        if (nova === atual) return;

        // trava os botões enquanto salva
        grupo.querySelectorAll(".cart-qty-btn").forEach(function (b) { b.disabled = true; });

        fetch("/carrinho/quantidade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken(),
            "X-Requested-With": "fetch",
          },
          body: JSON.stringify({ itemId: itemId, quantidade: nova, _csrf: csrfToken() }),
        })
          .then(function (res) {
            if (res.status === 401) { window.location.href = "/conta"; return null; }
            return res.json();
          })
          .then(function (data) {
            if (!data) return;
            // atualiza a quantidade exibida
            valorEl.textContent = data.quantidade;
            // atualiza o preço da linha
            var precoEl = document.querySelector('[data-price-for="' + itemId + '"]');
            if (precoEl) precoEl.textContent = "R$ " + brl(data.subtotalItem);
            // atualiza o resumo
            var sub = document.getElementById("cartSubtotal");
            var tot = document.getElementById("cartTotal");
            var cnt = document.getElementById("cartCount");
            if (sub) sub.textContent = "R$ " + brl(data.total);
            if (tot) tot.textContent = "R$ " + brl(data.total);
            if (cnt) cnt.textContent = data.contagem;
            atualizarBadge(data.contagem);
          })
          .catch(function () {})
          .finally(function () {
            grupo.querySelectorAll(".cart-qty-btn").forEach(function (b) { b.disabled = false; });
          });
      });
    });
  });
})();
