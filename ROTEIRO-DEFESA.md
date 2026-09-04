# 🎓 Roteiro de Defesa — Eco Companion

Guia de preparação para a apresentação do TCC. Reúne as perguntas mais prováveis da banca, agrupadas por tema, com respostas baseadas no código real do projeto. Leia, adapte para as suas palavras e pratique em voz alta.

> **Dica geral:** a banca valoriza mais você *entender* o que fez do que decorar. Se não souber algo, seja honesto e explique como descobriria. Nunca invente.

---

## 1. Visão geral do projeto

**P: Do que se trata o seu projeto?**
O Eco Companion é uma plataforma web de turismo sustentável, onde o usuário busca passagens e pacotes de viagem com a estimativa de impacto ambiental sempre visível. Tem conta de usuário, carrinho de compras, checkout e um painel administrativo. Foi desenvolvido em Node.js com o framework Express, seguindo a arquitetura MVC.

**P: Por que você escolheu esse tema?**
*(Responda com a sua motivação real — sustentabilidade, interesse por viagens, etc. A banca gosta de propósito.)*

**P: Qual problema ele resolve?**
Sites de viagem tradicionais não mostram o impacto ambiental das escolhas. O Eco Companion torna esse dado transparente, ajudando o viajante a decidir de forma mais consciente.

---

## 2. Arquitetura e organização

**P: Que arquitetura você usou e por quê?**
Usei o padrão **MVC (Model-View-Controller)**. Ele separa três responsabilidades: os **Models** cuidam dos dados, as **Views** cuidam da apresentação (o HTML), e os **Controllers** ficam no meio, com as regras de negócio. Separar assim deixa o código organizado, mais fácil de manter e de testar, porque cada parte tem uma função única.

**P: Como uma requisição percorre o sistema?**
Quando o usuário acessa uma URL, ela chega nas **rotas** (`routes/index.js`), que direcionam para o **controller** certo. O controller aplica as regras, consulta o **model** quando precisa de dados, e escolhe a **view** que será renderizada e devolvida como resposta. É o fluxo: Rota → Middleware → Controller → Model → View.

**P: O que são os partials nas views?**
São pedaços de HTML reutilizáveis — como o cabeçalho, o menu e o rodapé. Em vez de repetir esse código em toda página, eu o escrevo uma vez e incluo com `include`. Se eu mudar o menu, muda em todas as páginas de uma vez.

**P: Quantos controllers e models você tem?**
Cinco controllers (auth, perfil, páginas, carrinho e admin) e cinco models principais (Usuario, Carrinho, Pacote, ItemSalvo e Admin). O projeto tem 33 rotas no total.

---

## 3. Banco de dados

**P: Que banco de dados você usou?**
Os dados são persistidos em um arquivo JSON, acessado por uma camada de dados isolada (`config/database.js`). Optei por isso para o escopo do TCC porque não exige instalar nem configurar um servidor de banco externo — o projeto roda em qualquer máquina só com Node.js.

**P: E se você quisesse trocar por um banco real, como PostgreSQL?**
Como a camada de dados está isolada nos models, eu mudaria apenas os models para usar o novo banco — os controllers e as views não precisariam mudar. Essa separação é justamente uma vantagem do MVC.

**P: Como os pacotes são armazenados?**
No começo eles ficavam num arquivo de código, mas migrei para o banco para que o administrador possa editá-los. Fiz uma migração automática: na primeira execução, se o banco ainda não tem pacotes, ele é populado com os pacotes iniciais, sem perder nada.

---

## 4. Autenticação e segurança

**P: Como funciona o login?**
No cadastro, a senha nunca é salva em texto puro — ela passa pela biblioteca **bcrypt**, que gera um "hash" (uma versão embaralhada e irreversível). No login, comparo o hash da senha digitada com o hash salvo. Se baterem, crio uma **sessão** que mantém o usuário logado.

**P: Por que não guardar a senha direto?**
Se o banco vazasse, as senhas em texto puro seriam expostas. Com o hash do bcrypt, mesmo quem acessa o banco não consegue descobrir a senha original.

**P: O que é CSRF e como você protege contra isso?**
CSRF (Cross-Site Request Forgery) é quando um site malicioso engana o navegador de um usuário logado para executar uma ação sem ele querer — por exemplo, um link escondido que finaliza uma compra. Eu protejo com um **token**: gero um valor secreto único por sessão, coloco em cada formulário, e no servidor verifico se o token enviado bate com o da sessão. Se não bater, bloqueio. Implementei esse middleware do zero (`app/middlewares/csrf.js`).

**P: Que outras proteções de segurança você aplicou?**
- **Helmet**: adiciona cabeçalhos HTTP de segurança automaticamente.
- **Rate limiting**: limita tentativas de login (10 por IP a cada 15 minutos) contra ataques de força bruta.
- **Cookies seguros**: a sessão usa `httpOnly` (não acessível por JavaScript) e `sameSite`.
- **Validação no servidor**: nunca confio só no navegador.

**P: Como você impede que um usuário comum acesse o painel de admin?**
Tenho um middleware (`soAdmin.js`) que roda antes das rotas do admin. Ele consulta o banco e verifica se o usuário logado tem a marca de administrador. Se não tiver, retorna erro 403 (acesso proibido). Importante: a proteção é no **servidor**, não apenas escondendo o link do menu — mesmo digitando a URL direto, um usuário comum é barrado.

**P: Como alguém vira admin?**
Não é pelo site (senão qualquer um se tornaria admin). É por um script rodado no terminal pelo responsável (`node scripts/tornar-admin.js email`), que marca aquele usuário como administrador no banco.

---

## 5. Funcionalidades

**P: Como funciona o carrinho?**
O carrinho fica salvo no banco, por usuário (exige login). O usuário adiciona pacotes ou voos, ajusta quantidades, e o sistema calcula o total. Ao finalizar, os itens viram um **pedido** e o carrinho é esvaziado. O pedido fica no histórico do perfil.

**P: O pagamento é real?**
Não. O checkout é **simulado** — tem a tela de cartão e Pix, mas nenhuma cobrança acontece, e há um aviso claro pedindo para não inserir dados reais. Um pagamento verdadeiro exigiria integrar um gateway como Stripe ou Mercado Pago, que trata os dados do cartão com segurança e conformidade (PCI-DSS). Foi uma decisão consciente de escopo.

**P: O que o admin consegue fazer?**
Ver estatísticas (usuários, pedidos, receita), listar todos os pedidos e usuários, e gerenciar os pacotes por completo: criar, editar e excluir (CRUD).

---

## 6. Testes

**P: Você testou o sistema? Como?**
Sim, tenho **37 testes automatizados** usando o test runner nativo do Node. Eles cobrem a lógica de negócio: carrinho, validação, CSRF, CRUD de pacotes e o histórico de pedidos. Rodo com `npm test`.

**P: Por que testes automatizados importam?**
Eles garantem que, se eu mudar algo, o que já funcionava continua funcionando. Na prática, meus testes já **encontraram um bug real**: quando dois pedidos eram criados no mesmo instante, a ordenação por data não os distinguia. O teste falhou, eu percebi e corrigi (passei a desempatar pelo número do pedido). Isso mostra o valor dos testes na prática.

**P: Qual a diferença entre teste manual e automatizado?**
No manual, eu clico e verifico na tela — funciona, mas é lento e fácil esquecer casos. O automatizado roda sozinho, em segundos, e testa dezenas de casos sempre da mesma forma.

---

## 7. Perguntas difíceis (esteja preparado)

**P: Qual foi o maior desafio?**
*(Conte um real — por exemplo, migrar os pacotes para o banco sem perder dados, ou implementar o CSRF entendendo o mecanismo.)*

**P: O que você faria diferente se recomeçasse?**
*(Mostre autocrítica: por exemplo, começaria com um banco de dados real desde o início, ou escreveria os testes junto com o código, não depois.)*

**P: O que falta para virar um produto real?**
Pagamento real com gateway, um banco de dados robusto, envio de e-mails (recuperação de senha), upload de imagens, e hospedagem com HTTPS. Sei o caminho de cada um.

**P: Você usou inteligência artificial para ajudar?**
*(Se usou, seja honesto. O importante é deixar claro que você entende o que o código faz e consegue explicar cada parte — que é o que esta preparação comprova.)*

---

## 8. Frases de fechamento

Para encerrar a apresentação, um resumo do que você entregou:

> "O Eco Companion é uma aplicação web completa, com arquitetura MVC, autenticação segura, carrinho e checkout, painel administrativo com controle de acesso, e 37 testes automatizados. Mais do que as funcionalidades, procurei aplicar boas práticas de segurança e organização de código que se usam no mercado."

---

**Bons estudos e boa defesa! 🚀**
