// app/utils/validacao.js — regras de validação reutilizáveis e testáveis.

const validacao = {
  emailValido(email) {
    const e = String(email || "").trim();
    if (!e || e.length > 120) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  },

  senhaValida(senha) {
    if (!senha || senha.length < 8 || senha.length > 100) return false;
    // exige ao menos uma letra e um número
    return /[a-zA-Z]/.test(senha) && /[0-9]/.test(senha);
  },

  // valida credenciais e retorna a lista de erros (vazia = tudo certo)
  validaCredenciais({ email, senha }) {
    const erros = [];
    if (!this.emailValido(email)) erros.push("Informe um e-mail válido.");
    if (!this.senhaValida(senha)) {
      if (!senha || senha.length < 8) erros.push("A senha deve ter ao menos 8 caracteres.");
      else erros.push("A senha deve conter letras e números.");
    }
    return erros;
  },
};

module.exports = validacao;
