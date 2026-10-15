// app/utils/tratarErros.js — envolve um controller para capturar erros.
//
// No Express, se um controller lança um erro (ex.: falha ao ler dados),
// sem tratamento o servidor pode travar. Esta função "embrulha" o
// controller: se ele falhar, o erro é encaminhado para o tratador de
// erros global (definido no app.js), que mostra uma página amigável.
//
// Uso na rota:  router.get("/rota", tratarErros(controller.metodo))

function tratarErros(fn) {
  return function (req, res, next) {
    try {
      const resultado = fn(req, res, next);
      // se o controller for assíncrono (retorna Promise), captura rejeições
      if (resultado && typeof resultado.catch === "function") {
        resultado.catch(next);
      }
    } catch (erro) {
      next(erro);
    }
  };
}

module.exports = tratarErros;
