// help-chat.js — assistente de ajuda local.
// Responde por palavras-chave a partir de uma base de conhecimento.
// Não depende de internet nem de API: funciona aberto localmente ou publicado.

(function () {
  "use strict";

  // base de conhecimento: cada item tem palavras-chave e a resposta
  var KB = [
    {
      keys: ["cashback", "saldo", "resgatar", "resgate", "dinheiro de volta", "5%"],
      answer: "O cashback devolve 5% do valor de cada pacote ou voo que você salva. O saldo se acumula no seu perfil e pode ser resgatado pelo botão \"Resgatar saldo\". Por ser uma demonstração, o saldo não vira dinheiro real."
    },
    {
      keys: ["salvar voo", "salvo um voo", "guardar voo", "salvar passagem"],
      answer: "Na página de Passagens, faça uma busca e clique em \"Salvar voo\" no voo que quiser. Ele vai para a seção \"Voos salvos\" do seu perfil e gera 5% de cashback."
    },
    {
      keys: ["buscar", "busca", "procurar voo", "passagem", "passagens", "voo"],
      answer: "Para buscar passagens, abra a página de Passagens, informe origem, destino e datas e clique em \"Buscar\". Você também pode tocar em um destino popular para ver os voos na hora."
    },
    {
      keys: ["incluso", "inclui", "incluído", "o que vem", "pacote inclui"],
      answer: "Cada pacote mostra o que está incluso (passagem, noites de hospedagem, traslados e passeios) e um roteiro dia a dia. Abra a página do pacote para ver os detalhes completos."
    },
    {
      keys: ["reservar", "reserva", "comprar pacote", "fechar pacote"],
      answer: "Na página de cada pacote há o botão \"Reservar\". Nesta demonstração a reserva é simulada — não há cobrança nem pagamento real."
    },
    {
      keys: ["salvar pacote", "guardar pacote"],
      answer: "Em cada pacote (na home ou na página dele) há o botão \"Salvar pacote\". Ele vai para o seu perfil e também gera 5% de cashback."
    },
    {
      keys: ["carbono", "co2", "emissão", "emissao", "impacto", "pegada"],
      answer: "Cada voo mostra uma estimativa de emissão de CO₂ por passageiro, e destacamos a opção de menor emissão. Serve para você comparar o impacto ambiental entre os voos."
    },
    {
      keys: ["conta", "cadastro", "cadastrar", "criar conta", "registrar"],
      answer: "Para criar uma conta, abra \"Minha conta\", vá na aba \"Cadastrar\" e informe nome, e-mail e senha. Nesta demonstração os dados ficam só no seu navegador."
    },
    {
      keys: ["entrar", "login", "logar", "acessar conta"],
      answer: "Acesse \"Minha conta\" e use a aba \"Entrar\" com seu e-mail e senha. Se você já tinha usado o site neste navegador, seus dados continuam salvos."
    },
    {
      keys: ["pontos", "companion"],
      answer: "Os pontos Companion são acumulados a cada pacote ou voo salvo e aparecem no seu perfil. São um recurso demonstrativo, sem valor real."
    },
    {
      keys: ["tema", "escuro", "claro", "dark", "modo noturno"],
      answer: "Use o botão de sol/lua no topo do site para alternar entre tema claro e escuro. Sua preferência fica salva para as próximas visitas."
    },
    {
      keys: ["perfil", "meus dados", "alterar dados", "editar perfil"],
      answer: "No seu perfil você edita nome, cidade e estilo de viagem, e vê suas buscas, pacotes e voos salvos, além do saldo de cashback."
    },
    {
      keys: ["privacidade", "dados", "seguro", "segurança", "seguranca", "lgpd"],
      answer: "Seus dados ficam apenas no seu navegador, não vão para servidores. Veja mais nas páginas de Privacidade e Segurança, no rodapé do site."
    },
    {
      keys: ["contato", "falar", "falo com", "voces", "vocês", "atendimento", "telefone", "email", "e-mail", "humano", "ajuda de verdade"],
      answer: "Você pode falar com a equipe pelo e-mail contato@ecocompanion.com ou pelo telefone (21) 99999-8888."
    },
    {
      keys: ["cancelar", "cancelamento", "reembolso", "estorno"],
      answer: "Como este é um projeto demonstrativo, não há reservas reais a cancelar. Você pode remover pacotes ou voos salvos diretamente no seu perfil."
    }
  ];

  var FALLBACK = "Não tenho certeza sobre isso, mas posso ajudar com conta, busca de passagens, pacotes, cashback e impacto de carbono. Tente reformular, ou fale com a equipe em contato@ecocompanion.com.";
  var GREETING = "Olá! Sou o assistente do Eco Companion. Pergunte sobre passagens, pacotes, cashback, sua conta e mais. Como posso ajudar?";

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove acentos
  }

  function findAnswer(question) {
    var q = normalize(question);
    var best = null;
    var bestScore = 0;

    KB.forEach(function (item) {
      var score = 0;
      item.keys.forEach(function (key) {
        if (q.indexOf(normalize(key)) !== -1) {
          // chaves maiores valem mais (mais específicas)
          score += key.length;
        }
      });
      if (score > bestScore) { bestScore = score; best = item; }
    });

    return best ? best.answer : FALLBACK;
  }

  // ---------- UI ----------
  var log = document.getElementById("chatLog");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var suggestions = document.getElementById("chatSuggestions");

  if (!log || !form || !input) return;

  function addMessage(text, who) {
    var msg = document.createElement("section");
    msg.className = "chat-msg chat-msg--" + who;
    var bubble = document.createElement("p");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    msg.appendChild(bubble);
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }

  function botReply(question) {
    // pequeno atraso para parecer natural
    var typing = document.createElement("section");
    typing.className = "chat-msg chat-msg--bot";
    typing.innerHTML = '<p class="chat-bubble chat-typing"><span></span><span></span><span></span></p>';
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;

    setTimeout(function () {
      log.removeChild(typing);
      addMessage(findAnswer(question), "bot");
    }, 450);
  }

  function send(question) {
    var text = question.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    botReply(text);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value);
  });

  // perguntas rápidas (chips)
  if (suggestions) {
    suggestions.querySelectorAll(".chat-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { send(chip.textContent); });
    });
  }

  // saudação inicial
  addMessage(GREETING, "bot");
})();
