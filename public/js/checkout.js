// checkout.js — alterna entre cartão e Pix e formata os campos (demonstração).

(function () {
  "use strict";

  var cardFields = document.getElementById("cardFields");
  var pixFields = document.getElementById("pixFields");
  var radios = document.querySelectorAll('input[name="pagamento"]');

  function atualizar() {
    var metodo = document.querySelector('input[name="pagamento"]:checked');
    var isPix = metodo && metodo.value === "pix";
    if (cardFields) cardFields.classList.toggle("is-hidden", isPix);
    if (pixFields) pixFields.classList.toggle("is-hidden", !isPix);
  }

  radios.forEach(function (r) { r.addEventListener("change", atualizar); });
  atualizar();

  var num = document.getElementById("cardNum");
  if (num) {
    num.addEventListener("input", function () {
      var v = num.value.replace(/\D/g, "").slice(0, 16);
      num.value = v.replace(/(.{4})/g, "$1 ").trim();
    });
  }
  var exp = document.getElementById("cardExp");
  if (exp) {
    exp.addEventListener("input", function () {
      var v = exp.value.replace(/\D/g, "").slice(0, 4);
      exp.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
    });
  }
  var cvv = document.getElementById("cardCvv");
  if (cvv) {
    cvv.addEventListener("input", function () {
      cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
    });
  }
})();
