// add-cart.js — adiciona pacote ao carrinho sem sair da página,
// mostrando um aviso ("toast") e atualizando o contador do topo.
// Se o JavaScript estiver desativado, o formulário funciona normalmente
// (envia via POST e leva ao carrinho) — isso se chama "melhoria progressiva".

(function () {
  "use strict";

  var form = document.getElementById("addCartForm");
  if (!form) return;

  var btn = document.getElementById("addCartBtn");

  function csrfToken() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute("content") : "";
  }

  // cria (uma vez) o elemento do aviso
  function mostrarToast(texto) {
    var toast = document.getElementById("cartToast");
    if (!toast) {
      toast = document.createElement("aside");
      toast.id = "cartToast";
      toast.className = "cart-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.innerHTML =
      '<span class="cart-toast-check" aria-hidden="true">✓</span>' +
      "<span>" + texto + '</span> <a href="/carrinho">Ver carrinho</a>';
    // força reflow para reiniciar a animação, depois mostra
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3500);
  }

  function atualizarBadge(qtd) {
    var cart = document.querySelector(".topbar-cart");
    if (!cart) return;
    var badge = cart.querySelector(".cart-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-count";
      cart.appendChild(badge);
    }
    badge.textContent = qtd;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (btn) { btn.disabled = true; btn.textContent = "Adicionando..."; }

    fetch("/carrinho/adicionar-pacote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
        "X-Requested-With": "fetch",
      },
      body: JSON.stringify({ id: form.querySelector('input[name="id"]').value, _csrf: csrfToken() }),
    })
      .then(function (res) {
        if (res.status === 401) { window.location.href = "/conta"; return null; }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        atualizarBadge(data.quantidade);
        mostrarToast("Adicionado ao carrinho!");
      })
      .catch(function () {
        // se algo falhar, envia o formulário do jeito tradicional
        form.submit();
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = "Adicionar ao carrinho"; }
      });
  });
})();
