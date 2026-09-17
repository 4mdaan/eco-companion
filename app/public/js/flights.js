// flights.js — gera e exibe voos fictícios para a rota buscada.
// Voos podem ser salvos no perfil, rendendo cashback de 5% (igual aos pacotes).

(function () {
  "use strict";

  function csrfToken() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute("content") : "";
  }

  var CASHBACK_RATE = (window.ECO_CASHBACK_RATE != null) ? window.ECO_CASHBACK_RATE : 0.05;

  var AIRLINES = ["Azul Verde", "LATAM Eco", "GOL Neutra", "Voe Brasil"];

  // ids de voos já salvos nesta sessão de página (reflete o botão "Salvo ✓")
  var salvosLocais = {};

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function formatBRL(v) { return (Number(v) || 0).toFixed(2).replace(".", ","); }

  // gera um número "estável" a partir de um texto (para a rota dar sempre os mesmos voos)
  function seedFrom(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) % 100000; }
    return h;
  }
  function pseudo(seed, i) {
    var x = Math.sin(seed * 9301 + i * 49297) * 233280;
    return x - Math.floor(x); // 0..1
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function addMinutes(h, m, total) {
    var t = h * 60 + m + total;
    var nh = Math.floor(t / 60) % 24;
    var nm = t % 60;
    return pad(nh) + ":" + pad(nm);
  }

  // monta a lista de voos para uma rota
  var STOP_CITIES = ["Brasília", "Belo Horizonte", "Campinas", "Confins", "Guarulhos"];
  var CABINS = ["Econômica", "Econômica", "Econômica", "Premium Economy"];

  function buildFlights(origem, destino) {
    var seed = seedFrom((origem + destino).toLowerCase());
    var count = 5;
    var flights = [];

    for (var i = 0; i < count; i++) {
      var r1 = pseudo(seed, i + 1);
      var r2 = pseudo(seed, i + 7);
      var r3 = pseudo(seed, i + 13);
      var r4 = pseudo(seed, i + 31);

      var depH = 5 + Math.floor(r1 * 16);          // 05h..20h
      var depM = Math.floor(r2 * 4) * 15;          // 00,15,30,45
      var durMin = 70 + Math.floor(r3 * 230);      // 1h10..4h60
      var stops = r1 > 0.7 ? 1 : 0;                // alguns com 1 escala
      var basePrice = 180 + Math.floor(r2 * 920);  // R$180..1100
      var price = stops === 0 ? Math.round(basePrice * 1.15) : basePrice; // direto custa mais
      var carbon = Math.round((durMin * 1.6 + (stops ? 40 : 0)));

      // detalhes extras
      var checkedBag = r4 > 0.45;                  // bagagem despachada inclusa?
      var seatChoice = r3 > 0.6;                   // escolha de assento inclusa?
      var cabin = CABINS[Math.floor(r4 * CABINS.length)];
      var stopCity = stops ? STOP_CITIES[Math.floor(pseudo(seed, i + 41) * STOP_CITIES.length)] : null;

      flights.push({
        id: "f" + i + "-" + seed,
        airline: AIRLINES[Math.floor(pseudo(seed, i + 20) * AIRLINES.length)],
        dep: pad(depH) + ":" + pad(depM),
        arr: addMinutes(depH, depM, durMin + stops * 55),
        durMin: durMin + stops * 55,
        stops: stops,
        stopCity: stopCity,
        price: price,
        carbon: carbon,
        cabin: cabin,
        checkedBag: checkedBag,
        carryOn: true,
        seatChoice: seatChoice,
        origem: origem,
        destino: destino
      });
    }
    return flights;
  }

  function durLabel(min) {
    return Math.floor(min / 60) + "h " + pad(min % 60) + "m";
  }

  var state = { flights: [], sort: "preco", origem: "", destino: "" };

  function sortFlights(list, sort) {
    var copy = list.slice();
    copy.sort(function (a, b) {
      if (sort === "duracao") return a.durMin - b.durMin;
      if (sort === "carbono") return a.carbon - b.carbon;
      return a.price - b.price;
    });
    return copy;
  }

  function isSaved(id) {
    return !!salvosLocais[id];
  }

  function render() {
    var listEl = document.getElementById("flightList");
    if (!listEl) return;
    var ordered = sortFlights(state.flights, state.sort);
    listEl.innerHTML = "";

    // menor emissão para destacar a opção mais verde
    var minCarbon = Math.min.apply(null, state.flights.map(function (f) { return f.carbon; }));

    ordered.forEach(function (f) {
      var saved = isSaved(f.id);
      var greenTag = f.carbon === minCarbon ? '<span class="flight-green">Menor emissão</span>' : "";
      var stopsLabel = f.stops === 0 ? "Direto" : "1 escala em " + escapeHtml(f.stopCity);
      var cashback = f.price * CASHBACK_RATE;

      // chips de detalhes
      var chips = "";
      chips += '<span class="flight-chip">' + escapeHtml(f.cabin) + "</span>";
      chips += '<span class="flight-chip">Mala de mão</span>';
      chips += f.checkedBag
        ? '<span class="flight-chip flight-chip--on">Bagagem despachada</span>'
        : '<span class="flight-chip flight-chip--off">Sem despacho</span>';
      chips += f.seatChoice
        ? '<span class="flight-chip flight-chip--on">Escolha de assento</span>'
        : '<span class="flight-chip flight-chip--off">Assento na chegada</span>';

      var card = document.createElement("article");
      card.className = "flight";
      card.setAttribute("role", "listitem");
      card.innerHTML =
        '<section class="flight-main">' +
          '<section class="flight-time">' +
            "<strong>" + escapeHtml(f.dep) + "</strong>" +
            '<span class="flight-arrow" aria-hidden="true">→</span>' +
            "<strong>" + escapeHtml(f.arr) + "</strong>" +
          "</section>" +
          '<section class="flight-meta">' +
            "<span>" + escapeHtml(f.airline) + "</span>" +
            "<span>" + durLabel(f.durMin) + " · " + stopsLabel + "</span>" +
          "</section>" +
          '<section class="flight-chips">' + chips + "</section>" +
        "</section>" +
        '<section class="flight-carbon">' +
          '<span class="flight-co2">' + f.carbon + " kg CO₂</span>" +
          greenTag +
        "</section>" +
        '<section class="flight-buy">' +
          '<p class="flight-price"><small>R$</small> ' + f.price + "</p>" +
          '<p class="flight-cashback">5% de volta: R$ ' + formatBRL(cashback) + "</p>" +
          '<button type="button" class="btn btn--accent flight-cart" data-id="' + escapeHtml(f.id) + '">Adicionar ao carrinho</button>' +
          '<button type="button" class="flight-save' + (saved ? " is-saved" : "") + '" data-id="' + escapeHtml(f.id) + '">' +
            (saved ? "Salvo ✓" : "Salvar voo") +
          "</button>" +
        "</section>";

      listEl.appendChild(card);
    });

    listEl.querySelectorAll(".flight-save").forEach(function (btn) {
      btn.addEventListener("click", function () { toggleSave(btn.getAttribute("data-id")); });
    });
    listEl.querySelectorAll(".flight-cart").forEach(function (btn) {
      btn.addEventListener("click", function () { addToCart(btn.getAttribute("data-id"), btn); });
    });
  }

  function addToCart(id, btn) {
    var flight = state.flights.filter(function (f) { return f.id === id; })[0];
    if (!flight) return;
    fetch("/carrinho/adicionar-voo", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken() },
      body: JSON.stringify({
        refId: flight.id,
        nome: flight.origem + " \u2192 " + flight.destino,
        meta: flight.airline + " \u00b7 " + flight.dep + " \u00b7 " + (flight.stops === 0 ? "Direto" : "1 escala"),
        preco: flight.price
      })
    })
      .then(function (res) {
        if (res.status === 401) { window.location.href = "/conta"; return null; }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        if (btn) { btn.textContent = "Adicionado \u2713"; setTimeout(function () { btn.textContent = "Adicionar ao carrinho"; }, 1500); }
        atualizaBadgeCarrinho(data.quantidade);
      })
      .catch(function () {});
  }

  function atualizaBadgeCarrinho(qtd) {
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

  function toggleSave(id) {
    var flight = state.flights.filter(function (f) { return f.id === id; })[0];
    if (!flight) return;

    fetch("/salvar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken() },
      body: JSON.stringify({
        tipo: "voo",
        refId: flight.id,
        nome: flight.origem + " → " + flight.destino,
        meta: flight.airline + " · " + flight.dep + " · R$ " + flight.price,
        preco: flight.price,
        pontos: 0
      })
    })
      .then(function (res) {
        if (res.status === 401) { window.location.href = "/conta"; return null; }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        // atualiza o estado local do botão conforme a resposta do servidor
        if (data.salvo) salvosLocais[id] = true;
        else delete salvosLocais[id];
        render();
      })
      .catch(function () {
        // falha de rede: não quebra a página
      });
  }

  // expõe a função que a busca chama
  window.ecoShowFlights = function (origem, destino) {
    state.origem = origem;
    state.destino = destino;
    state.flights = buildFlights(origem, destino);
    state.sort = "preco";

    var section = document.getElementById("flights");
    var route = document.getElementById("flightsRoute");
    if (route) route.textContent = origem + " → " + destino + " · " + state.flights.length + " opções";

    // reseta filtros visuais
    document.querySelectorAll(".flight-filter").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-sort") === "preco");
    });

    render();
    if (section) {
      section.classList.remove("is-hidden");
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // filtros de ordenação
  document.querySelectorAll(".flight-filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".flight-filter").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.sort = btn.getAttribute("data-sort");
      render();
    });
  });

  // ---------- destinos populares ----------
  var POPULAR = [
    { city: "Rio de Janeiro", uf: "RJ", from: "279", img: "/img/rio.jpg" },
    { city: "Maceió", uf: "AL", from: "412", img: "/img/maceio.jpg" },
    { city: "Salvador", uf: "BA", from: "324", img: "/img/salvador.jpg" },
    { city: "Natal", uf: "RN", from: "389", img: "/img/natal.jpg" },
    { city: "Gramado", uf: "RS", from: "298", img: "/img/gramado.jpg" },
    { city: "Bonito", uf: "MS", from: "455", img: "/img/bonito.jpg" }
  ];

  function startSearchTo(city) {
    var origemEl = document.getElementById("origem");
    var destinoEl = document.getElementById("destino");
    var idaEl = document.getElementById("ida");
    if (!origemEl || !destinoEl) return;

    if (!origemEl.value.trim()) origemEl.value = "São Paulo";
    destinoEl.value = city;

    // data de ida: 14 dias à frente, se vazia
    if (idaEl && !idaEl.value) {
      var d = new Date();
      d.setDate(d.getDate() + 14);
      idaEl.value = d.toISOString().split("T")[0];
    }

    if (typeof window.ecoShowFlights === "function") {
      window.ecoShowFlights(origemEl.value.trim(), city);
    }
  }

  var popularGrid = document.getElementById("popularGrid");
  if (popularGrid) {
    POPULAR.forEach(function (p) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "pop-card";
      card.innerHTML =
        '<span class="pop-img" style="background-image:url(' + p.img + ')"></span>' +
        '<span class="pop-body">' +
          '<span class="pop-city">' + escapeHtml(p.city) + " <small>" + escapeHtml(p.uf) + "</small></span>" +
          '<span class="pop-price">a partir de <strong>R$ ' + escapeHtml(p.from) + "</strong></span>" +
        "</span>";
      card.addEventListener("click", function () { startSearchTo(p.city); });
      popularGrid.appendChild(card);
    });
  }
})();
