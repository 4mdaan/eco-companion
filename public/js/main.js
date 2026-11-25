// main.js — utilidades compartilhadas

(function () {
  "use strict";

  var year = String(new Date().getFullYear());
  // preenche o ano em qualquer elemento marcado (#ano legado ou .ano-js)
  document.querySelectorAll("#ano, .ano-js").forEach(function (el) {
    el.textContent = year;
  });

  var menuToggle = document.getElementById("topbarMenuToggle");
  var navigation = document.getElementById("primary-navigation");

  if (menuToggle && navigation) {
    function closeMenu() {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      navigation.classList.remove("is-open");
    }

    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }
})();
