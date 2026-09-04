# 🎬 Roteiro de Demonstração — Eco Companion

> Passo a passo para apresentar o sistema ao vivo, sem travar. Ensaie 2-3 vezes antes do dia. A ideia é mostrar o melhor do projeto num caminho fluido, do começo ao fim.

---

## Antes de começar (preparação)

Faça isto **minutos antes** da apresentação:

1. Abra o terminal na pasta do projeto e rode `npm start`.
2. Confirme que aparece `Eco Companion rodando em http://localhost:3000`.
3. Abra o navegador em `http://localhost:3000` e deixe pronto.
4. Tenha **duas contas prontas** (crie antes):
   - Uma conta **normal** (ex.: `cliente@teste.com`)
   - Uma conta **admin** (crie e rode `node scripts/tornar-admin.js seu-email`)
5. Deixe o **código aberto no VS Code** em outra janela, caso peçam para mostrar.
6. Tenha este roteiro impresso ou numa segunda tela.

> **Dica de ouro:** teste o fluxo inteiro uma vez, minutos antes. Se algo falhar, você tem tempo de reiniciar.

---

## O tour (siga nesta ordem)

### Parte 1 — Apresentação do produto (2 min)

1. Comece na **home**. Mostre o visual, a proposta (turismo sustentável) e os pacotes.
2. Clique num **pacote** (ex.: Rio de Janeiro). Mostre a página de detalhes: roteiro, o que inclui, avaliações e a **ficha de impacto ambiental** — o diferencial do projeto.
3. Fale: *"Cada pacote tem informação de sustentabilidade para o viajante escolher de forma consciente."*

### Parte 2 — Cadastro e login (1 min)

4. Clique em entrar e mostre a tela de **login/cadastro**.
5. Faça login com a conta normal (ou mostre um cadastro rápido).
6. Mencione: *"A senha é criptografada com bcrypt e a sessão usa cookies seguros."*

### Parte 3 — A jornada de compra (3 min) — o coração da demo

7. Volte a um pacote e clique em **Adicionar ao carrinho**. Mostre o aviso que aparece sem sair da página.
8. Adicione outro item para o carrinho ter mais de um.
9. Vá ao **carrinho**. Mostre os itens, mude a **quantidade** com os botões +/− e destaque o total recalculando na hora.
10. Clique em **Ir para o pagamento**. Mostre a tela de checkout.
11. Fale claramente: *"O pagamento é simulado — nenhuma cobrança real é feita. Um pagamento verdadeiro exigiria um gateway como Stripe ou Mercado Pago."*
12. Finalize a compra e mostre a **tela de pedido confirmado**.

### Parte 4 — Área do usuário (1 min)

13. Vá ao **perfil**. Mostre os dados, os itens salvos e o **histórico de pedidos** (a compra que acabou de fazer aparece lá).

### Parte 5 — Painel administrativo (3 min) — o diferencial técnico

14. Faça **logout** e entre com a conta **admin**. Mostre que o link "Admin" aparece só para ela.
15. Abra o **painel admin**. Mostre a visão geral (estatísticas), a lista de **pedidos** e de **usuários**.
16. Vá em **Pacotes** e demonstre o **CRUD**: edite o preço de um pacote e mostre a mudança refletida no site.
17. Ponto forte para falar: *"O acesso ao admin é protegido no servidor. Se um usuário comum tentar acessar a URL /admin, recebe erro 403 — não basta esconder o link."*

### Parte 6 — Qualidade técnica (2 min)

18. Volte ao **VS Code**. Rode `npm test` no terminal e mostre os **40 testes passando**.
19. Fale: *"Tenho 40 testes automatizados cobrindo carrinho, validação, segurança e o CRUD. Eles já pegaram um bug real de ordenação de pedidos."*
20. Se quiser, abra o `app/middlewares/csrf.js` e explique brevemente a proteção CSRF que você implementou do zero.

---

## Encerramento

Termine com uma frase que resume o valor:

> *"O Eco Companion cobre todo o ciclo de um e-commerce — do cadastro à compra e à administração — com arquitetura MVC, segurança em camadas e qualidade comprovada por testes automatizados."*

---

## Se algo der errado (plano B)

- **O servidor não sobe:** confira se está na pasta certa (com o `package.json`) e se rodou `npm install`.
- **Um bug aparece na hora:** mantenha a calma, diga *"vou mostrar por outro caminho"* e siga para a próxima parte. Não tente depurar ao vivo.
- **Esqueceu a senha do admin:** tenha as credenciais anotadas neste roteiro.
- **Trava total:** tenha um **vídeo de 2-3 min** gravado do fluxo como reserva.

---

## Checklist rápido do dia

- [ ] Servidor rodando e testado
- [ ] Conta normal e conta admin funcionando
- [ ] Código aberto no VS Code
- [ ] Este roteiro à mão
- [ ] Vídeo reserva gravado (opcional)
- [ ] Água por perto e respirar fundo 🙂
