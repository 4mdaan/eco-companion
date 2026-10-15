# Diagrama do Banco de Dados (Modelo Entidade-Relacionamento)

Este é o modelo de dados do Eco Companion. O usuário é a entidade central.

## Relações

- Um **usuário** possui muitos itens no **carrinho** (1:N)
- Um **usuário** realiza muitos **pedidos** (1:N)
- Um **usuário** salva muitos **itens salvos** (1:N)
- Um **pacote** pode estar em muitos itens de **carrinho** (1:N)
- Um **pacote** pode ser referenciado em muitos **itens salvos** (1:N)

## Código Mermaid (cole em https://mermaid.live para visualizar)

```mermaid
erDiagram
  USUARIOS ||--o{ CARRINHO : possui
  USUARIOS ||--o{ PEDIDOS : realiza
  USUARIOS ||--o{ ITENS_SALVOS : salva
  PACOTES ||--o{ CARRINHO : "está em"
  PACOTES ||--o{ ITENS_SALVOS : "referenciado em"
  USUARIOS {
    int id PK
    string nome
    string email
    string senha_hash
    string cidade
    int pontos
    real cashback
    bool admin
  }
  PACOTES {
    string id PK
    string title
    string price
    string nights
    real score
    string summary
  }
  CARRINHO {
    int id PK
    int usuario_id FK
    string tipo
    string ref_id
    string nome
    real preco
    int quantidade
  }
  PEDIDOS {
    int id PK
    int usuario_id FK
    real total
    string itens_json
    string pagamento
    string status
    string criado_em
  }
  ITENS_SALVOS {
    int id PK
    int usuario_id FK
    string tipo
    string ref_id
    string nome
    real preco
  }
```

## Decisão de design importante

Nos **pedidos**, os itens comprados são guardados como `itens_json` — uma "fotografia" do que foi comprado no momento. Assim, o histórico do pedido preserva os dados originais mesmo que o pacote mude de preço ou seja excluído depois.
