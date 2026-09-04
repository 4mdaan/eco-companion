# 🧳 Eco Companion

> Plataforma web de turismo sustentável — busca de passagens, pacotes de viagem com ficha de impacto ambiental, carrinho de compras e área do usuário.

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC), aplicando o padrão de arquitetura **MVC** com **Node.js**, **Express** e **EJS**, com foco em boas práticas de segurança e código testado.

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Segurança](#-segurança)
- [Como executar](#-como-executar)
- [Testes](#-testes)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Decisões técnicas](#-decisões-técnicas)

---

## ✨ Funcionalidades

- **Busca de passagens** com filtros e estimativa de emissão de carbono por voo.
- **Pacotes de viagem** com página de detalhes rica: roteiro dia a dia, o que está (e não está) incluso, avaliações e ficha de impacto ambiental.
- **Autenticação real**: cadastro e login com senha criptografada e sessão.
- **Área do usuário**: perfil editável, itens salvos, pontos e cashback.
- **Carrinho de compras** persistido por usuário, com quantidades e checkout.
- **Checkout** com pagamento simulado (cartão/Pix) e confirmação de pedido.
- **Central de ajuda** com assistente de perguntas frequentes.
- **Histórico de pedidos** na área do usuário.
- **Painel administrativo** com controle de acesso por papel (só admins), com visão geral, pedidos, usuários e catálogo.
- **Tema claro/escuro** com preferência salva no navegador.
- **Design responsivo** — funciona em celular, tablet e desktop.

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Servidor | Node.js + Express |
| Templates | EJS (Embedded JavaScript) |
| Banco de dados | Armazenamento em JSON (sem dependências nativas) |
| Autenticação | bcryptjs (hash de senha) + express-session |
| Segurança | Helmet, express-rate-limit, proteção CSRF própria |
| Testes | Test runner nativo do Node (`node:test`) |
| Front-end | HTML5 semântico, CSS3, JavaScript (sem frameworks) |

---

## 🏛 Arquitetura

O projeto segue o padrão **MVC (Model-View-Controller)**, separando responsabilidades:

- **Models** (`app/models`): acesso e manipulação dos dados (usuários, carrinho, itens).
- **Views** (`views`): templates EJS que geram o HTML, com parciais reutilizáveis (cabeçalho, menu, rodapé).
- **Controllers** (`app/controllers`): recebem as requisições, aplicam as regras de negócio e escolhem a view.
- **Routes** (`routes`): mapeiam cada URL para o controller responsável.
- **Middlewares** (`app/middlewares`): funções que interceptam as requisições (ex.: proteção CSRF).

```
Requisição → Rota → Middleware → Controller → Model → View → Resposta
```

---

## 🔒 Segurança

A segurança foi tratada como requisito, não como detalhe:

- **Senhas criptografadas** com bcrypt (nunca armazenadas em texto puro).
- **Sessões** com cookie `httpOnly` (não acessível por JavaScript), `sameSite` e `secure` em produção.
- **Helmet**: cabeçalhos HTTP de segurança e Content-Security-Policy.
- **Rate limiting**: no máximo 10 tentativas de login por IP a cada 15 minutos, contra ataques de força bruta.
- **Proteção CSRF própria**: token único por sessão, validado em todo formulário e requisição que altera dados.
- **Validação server-side**: nunca confia apenas no navegador.
- **Tratamento de erros global**: evita que o servidor exponha detalhes internos.

---

## 🚀 Como executar

**Pré-requisitos:** [Node.js](https://nodejs.org) versão 18 ou superior.

```bash
# 1. Instale as dependências
npm install

# 2. (Opcional) crie o arquivo de ambiente
cp .env.example .env

# 3. Inicie o servidor
npm start
```

Depois abra **http://localhost:3000** no navegador.

---

## 🧪 Testes

O projeto tem testes automatizados cobrindo a lógica de negócio (carrinho, validação, segurança CSRF):

```bash
npm test
```

São **29 testes** distribuídos em 5 grupos, usando o test runner nativo do Node — sem bibliotecas externas.

---

## 📁 Estrutura de pastas

```
eco-companion/
├── app/
│   ├── controllers/     # Regras de negócio (auth, perfil, páginas, carrinho)
│   ├── models/          # Acesso aos dados (Usuario, Carrinho, ItemSalvo)
│   ├── middlewares/     # Proteção CSRF
│   └── utils/           # Funções reutilizáveis (validação)
├── config/
│   └── database.js      # Camada de dados (JSON)
├── public/              # Arquivos estáticos
│   ├── css/             # Estilos separados por página
│   │   ├── base.css     # Comum a todas (cabeçalho, rodapé, cores, botões)
│   │   └── paginas/     # Um arquivo por página (home, carrinho, admin...)
│   ├── img/             # Imagens
│   └── js/              # Scripts do navegador
├── routes/
│   └── index.js         # Mapeamento das rotas
├── views/
│   ├── pages/           # Páginas (home, pacote, carrinho, checkout...)
│   └── partials/        # Componentes reutilizáveis (header, menu, footer)
├── tests/               # Testes automatizados
├── app.js               # Ponto de entrada do servidor
└── package.json
```

---

## 💡 Decisões técnicas

**Por que MVC?** Separar dados, lógica e apresentação torna o código organizado, fácil de manter e de testar — cada parte tem uma responsabilidade única.

**Por que EJS?** Permite reaproveitar componentes (cabeçalho, menu, rodapé) em todas as páginas e renderizar dados do servidor diretamente no HTML, evitando repetição.

**Por que armazenamento em JSON?** Para o escopo do TCC, evita a complexidade de instalar e configurar um banco externo, mantendo o projeto fácil de rodar em qualquer máquina. A camada de dados é isolada, então trocar por um banco real (PostgreSQL, MySQL) exigiria mudar apenas os models.

**Por que CSRF próprio?** Implementar a proteção do zero demonstra compreensão real do mecanismo de ataque e defesa, em vez de apenas usar uma biblioteca pronta.

**Sobre o pagamento:** o checkout é **simulado** — nenhuma cobrança real é feita. Um pagamento verdadeiro exigiria integração com um gateway (Stripe, Mercado Pago), que trata os dados do cartão com segurança e conformidade (PCI-DSS).

## 👤 Acesso administrativo

O painel `/admin` é restrito a administradores. Para tornar um usuário admin:

```bash
# 1. Cadastre-se normalmente pelo site
# 2. Rode o script com o e-mail cadastrado
node scripts/tornar-admin.js seu-email@exemplo.com
```

Depois, o link **Admin** aparece no menu e o painel fica acessível. Usuários comuns que tentarem acessar `/admin` recebem "acesso proibido" (403) — o controle é feito no servidor, não apenas escondendo o link.

---

## 📄 Licença

Projeto acadêmico desenvolvido para fins educacionais.
