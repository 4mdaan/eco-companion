// main.js — utilidades compartilhadas

(function () {
  "use strict";

  var year = String(new Date().getFullYear());
  // preenche o ano em qualquer elemento marcado (#ano legado ou .ano-js)
  document.querySelectorAll("#ano, .ano-js").forEach(function (el) {
    el.textContent = year;
  });
})();
