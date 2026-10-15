// theme.js — alterna entre tema claro e escuro e lembra a escolha.
// Carregado no <head> (sem defer) para aplicar o tema antes de pintar a tela.

(function () {
  "use strict";

  var KEY = "ecoViagensTheme";

  function getStored() {
    try { return localStorage.getItem(KEY); }
    catch (e) { return null; }
  }
  function store(value) {
    try { localStorage.setItem(KEY, value); }
    catch (e) {}
  }

  // tema inicial: escolha salva > preferência do sistema > claro
  function initialTheme() {
    var saved = getStored();
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function apply(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  // aplica imediatamente (antes do corpo renderizar)
  apply(initialTheme());

  // configura o botão quando o DOM estiver pronto
  function setupButton() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    function refreshLabel() {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-label", isDark ? "Mudar para tema claro" : "Mudar para tema escuro");
      btn.setAttribute("aria-pressed", String(isDark));
    }
    refreshLabel();

    btn.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      apply(next);
      store(next);
      refreshLabel();
    });
  }

  // acompanha mudança do sistema apenas se o usuário ainda não escolheu manualmente
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var listener = function (e) {
      if (!getStored()) apply(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", listener);
    else if (mq.addListener) mq.addListener(listener);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupButton);
  } else {
    setupButton();
  }
})();
