// search-page.js — validação do formulário de busca, disparo dos voos
// e salvamento da busca no backend (banco de dados via /salvar).

(function () {
  "use strict";

  function csrfToken() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute("content") : "";
  }

  var form = document.getElementById("searchForm");
  if (!form) return;

  var voltaWrap = document.getElementById("voltaWrap");
  var volta = document.getElementById("volta");

  // datas mínimas = hoje
  var today = new Date().toISOString().split("T")[0];
  ["ida", "volta"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.min = today;
  });

  // tipo de viagem mostra/esconde a volta
  form.querySelectorAll('input[name="trip"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      var ida = radio.value === "ida-volta";
      if (voltaWrap) voltaWrap.classList.toggle("is-hidden", !ida);
      if (!ida && volta) { volta.value = ""; setError(volta, ""); }
    });
  });

  // inverter origem/destino
  var swap = document.getElementById("swapBtn");
  if (swap) {
    swap.addEventListener("click", function () {
      var o = document.getElementById("origem");
      var d = document.getElementById("destino");
      var tmp = o.value; o.value = d.value; d.value = tmp;
    });
  }

  function setError(input, msg) {
    var slot = document.querySelector('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate() {
    var ok = true;
    var origem = document.getElementById("origem");
    var destino = document.getElementById("destino");
    var ida = document.getElementById("ida");

    [origem, destino, ida].forEach(function (el) {
      if (!el.value.trim()) { setError(el, "Obrigatório"); ok = false; }
      else setError(el, "");
    });

    if (origem.value.trim() && origem.value.trim().toLowerCase() === destino.value.trim().toLowerCase()) {
      setError(destino, "Escolha um destino diferente"); ok = false;
    }

    var tripIda = form.querySelector('input[name="trip"]:checked').value === "ida-volta";
    if (tripIda && volta) {
      if (!volta.value) { setError(volta, "Obrigatório"); ok = false; }
      else if (ida.value && volta.value < ida.value) { setError(volta, "Depois da ida"); ok = false; }
    }
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = document.getElementById("searchStatus");
    if (!validate()) { if (status) status.textContent = ""; return; }

    var origem = document.getElementById("origem").value.trim();
    var destino = document.getElementById("destino").value.trim();
    if (status) status.textContent = "";

    // mostra os voos (função definida em flights.js)
    if (typeof window.ecoShowFlights === "function") {
      window.ecoShowFlights(origem, destino);
    }

    // salva a busca no backend (se logado); ignora silenciosamente se não estiver
    fetch("/salvar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken() },
      body: JSON.stringify({
        tipo: "busca",
        refId: origem + "-" + destino + "-" + Date.now(),
        nome: origem + " → " + destino,
        meta: "Ida " + document.getElementById("ida").value + (volta && volta.value ? " · Volta " + volta.value : ""),
        preco: 0,
        pontos: 0
      })
    }).catch(function () {});
  });
})();
