// auth-tabs.js — alterna entre Entrar/Cadastrar e mostra/oculta senha.

(function () {
  "use strict";

  var tabLogin = document.getElementById("tabLogin");
  var tabSignup = document.getElementById("tabSignup");
  var loginForm = document.getElementById("loginForm");
  var signupForm = document.getElementById("signupForm");

  function select(which) {
    var isLogin = which !== "signup";
    if (tabLogin) tabLogin.classList.toggle("is-active", isLogin);
    if (tabSignup) tabSignup.classList.toggle("is-active", !isLogin);
    if (loginForm) loginForm.classList.toggle("is-hidden", !isLogin);
    if (signupForm) signupForm.classList.toggle("is-hidden", isLogin);
  }

  if (tabLogin) tabLogin.addEventListener("click", function () { select("login"); });
  if (tabSignup) tabSignup.addEventListener("click", function () { select("signup"); });

  // mostrar/ocultar senha
  document.querySelectorAll(".input-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var field = document.getElementById(btn.getAttribute("data-toggle"));
      if (!field) return;
      var show = field.type === "password";
      field.type = show ? "text" : "password";
      btn.textContent = show ? "Ocultar" : "Mostrar";
    });
  });
})();
