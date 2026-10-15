-- ============================================================
--  Eco Companion — script do banco de dados (MySQL / MariaDB)
--  Cria o banco, as tabelas, os relacionamentos e os 8 pacotes
--  iniciais. Para executar: mysql -u root -p < script_bd.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS eco_companion
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eco_companion;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS pedido_itens, pedidos, carrinho, itens_salvos,
  pacote_avaliacoes, pacote_destaques, pacote_nao_inclui, pacote_inclui,
  pacote_roteiro, pacotes, usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
--  USUÁRIOS
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(120) NOT NULL UNIQUE,
  senha_hash VARCHAR(100) NOT NULL,          -- hash bcrypt, nunca a senha
  cidade     VARCHAR(80)  DEFAULT '',
  estilo     VARCHAR(30)  DEFAULT 'praia',
  pontos     INT          NOT NULL DEFAULT 0,
  cashback   DECIMAL(10,2) NOT NULL DEFAULT 0,
  admin      BOOLEAN      NOT NULL DEFAULT FALSE,
  foto       VARCHAR(200) DEFAULT NULL,
  criado_em  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  PACOTES (e tabelas filhas: roteiro, incluso, não incluso,
--  destaques e avaliações)
-- ------------------------------------------------------------
CREATE TABLE pacotes (
  id           VARCHAR(60) PRIMARY KEY,
  imagem       VARCHAR(100),
  titulo       VARCHAR(100) NOT NULL,
  duracao      VARCHAR(40)  NOT NULL,
  saida        VARCHAR(80),
  nota         DECIMAL(3,1),
  estrelas     TINYINT,
  destaque     VARCHAR(60),
  preco        DECIMAL(10,2) NOT NULL,
  pontos       INT DEFAULT 0,
  arte         VARCHAR(120),
  resumo       TEXT,
  impacto      TEXT,
  melhor_epoca VARCHAR(100),
  clima        VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE pacote_roteiro (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  pacote_id VARCHAR(60) NOT NULL,
  ordem     INT NOT NULL,
  descricao TEXT NOT NULL,
  FOREIGN KEY (pacote_id) REFERENCES pacotes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pacote_inclui (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  pacote_id VARCHAR(60) NOT NULL,
  ordem     INT NOT NULL,
  item      VARCHAR(200) NOT NULL,
  FOREIGN KEY (pacote_id) REFERENCES pacotes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pacote_nao_inclui (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  pacote_id VARCHAR(60) NOT NULL,
  ordem     INT NOT NULL,
  item      VARCHAR(200) NOT NULL,
  FOREIGN KEY (pacote_id) REFERENCES pacotes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pacote_destaques (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  pacote_id VARCHAR(60) NOT NULL,
  ordem     INT NOT NULL,
  item      VARCHAR(200) NOT NULL,
  FOREIGN KEY (pacote_id) REFERENCES pacotes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pacote_avaliacoes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  pacote_id VARCHAR(60) NOT NULL,
  nome      VARCHAR(80) NOT NULL,
  estrelas  TINYINT NOT NULL,
  texto     TEXT,
  FOREIGN KEY (pacote_id) REFERENCES pacotes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  ITENS SALVOS (pacotes, voos e buscas salvos no perfil)
-- ------------------------------------------------------------
CREATE TABLE itens_salvos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo       ENUM('pacote','voo','busca') NOT NULL,
  ref_id     VARCHAR(80),
  nome       VARCHAR(150) NOT NULL,
  meta       VARCHAR(200),
  preco      DECIMAL(10,2) DEFAULT 0,
  criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  CARRINHO (um por usuário, itens do tipo pacote ou voo)
-- ------------------------------------------------------------
CREATE TABLE carrinho (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo       ENUM('pacote','voo') NOT NULL,
  ref_id     VARCHAR(80) NOT NULL,
  nome       VARCHAR(150) NOT NULL,
  meta       VARCHAR(200),
  preco      DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantidade INT NOT NULL DEFAULT 1,
  criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  PEDIDOS e ITENS DO PEDIDO
--  O item guarda nome e preço do momento da compra (histórico
--  correto mesmo que o pacote mude de preço ou seja excluído).
-- ------------------------------------------------------------
CREATE TABLE pedidos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  total      DECIMAL(10,2) NOT NULL,
  pagamento  ENUM('cartao','pix') NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'confirmado',
  criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pedido_itens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id  INT NOT NULL,
  tipo       ENUM('pacote','voo') NOT NULL,
  ref_id     VARCHAR(80) NOT NULL,
  nome       VARCHAR(150) NOT NULL,
  meta       VARCHAR(200),
  preco      DECIMAL(10,2) NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  DADOS INICIAIS: os 8 pacotes do catálogo
-- ------------------------------------------------------------

-- Rio de Janeiro
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('rio', 'rio.jpg', 'Rio de Janeiro', '4 dias / 3 noites', 'Saindo de São Paulo', 8.4, 3, 'Oferta destaque', 521, 255, 'linear-gradient(135deg,#1f7a5a,#2fa37a)', 'Praia, mata e cidade num só roteiro, com hospedagem que trata o próprio esgoto e passeios a pé ou de transporte público.', 'Hospedagem com tratamento de água próprio e traslados compartilhados.', 'Abril a outubro (clima mais seco)', 'Tropical, quente o ano todo');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('rio', 1, 'Dia 1 — Chegada, check-in em Botafogo e caminhada pela orla ao pôr do sol.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('rio', 2, 'Dia 2 — Pão de Açúcar e Urca a pé, com guia local da comunidade.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('rio', 3, 'Dia 3 — Trilha leve no Parque da Tijuca e tarde livre em Copacabana.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('rio', 4, 'Dia 4 — Manhã livre e retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('rio', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('rio', 2, '3 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('rio', 3, 'Traslado aeroporto compartilhado');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('rio', 4, 'Guia local em 2 passeios');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('rio', 1, 'Passeios opcionais');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('rio', 2, 'Refeições além do café da manhã');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('rio', 3, 'Seguro viagem');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('rio', 1, 'Cristo Redentor e Pão de Açúcar');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('rio', 2, 'Praias de Copacabana e Ipanema');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('rio', 3, 'Trilhas na Floresta da Tijuca');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('rio', 'Marina T.', 5, 'Roteiro impecável e a pousada era linda. Voltarei!');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('rio', 'Carlos R.', 4, 'Cidade maravilhosa, só achei os deslocamentos um pouco corridos.');

-- Maceió
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('maceio', 'maceio.jpg', 'Maceió', '8 dias / 7 noites', 'Saindo de São Paulo', 9.1, 2, NULL, 1692, 779, 'linear-gradient(135deg,#14507f,#6ea8d6)', 'Piscinas naturais e praias calmas, com pousada de energia solar e passeios de jangada que limitam o número de visitantes.', 'Pousada movida a energia solar e passeios com lotação controlada.', 'Setembro a março (mar mais calmo)', 'Tropical litorâneo, sol o ano todo');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('maceio', 1, 'Dia 1 — Chegada e descanso na orla de Pajuçara.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('maceio', 2, 'Dias 2 a 4 — Piscinas naturais, Praia do Francês e São Miguel dos Milagres.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('maceio', 3, 'Dias 5 a 7 — Dias livres para mergulho e cultura local.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('maceio', 4, 'Dia 8 — Retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('maceio', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('maceio', 2, '7 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('maceio', 3, 'Passeio de jangada às piscinas naturais');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('maceio', 4, 'Traslado compartilhado');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('maceio', 1, 'Passeios opcionais');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('maceio', 2, 'Almoços e jantares');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('maceio', 3, 'Taxa de jangada extra');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('maceio', 1, 'Piscinas naturais de Pajuçara');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('maceio', 2, 'Praia do Francês');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('maceio', 3, 'Passeio de jangada');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('maceio', 'Aline C.', 5, 'As piscinas naturais valem cada centavo. Água cristalina!');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('maceio', 'Pedro M.', 5, 'Pousada com energia solar, atendimento nota 10.');

-- Natal
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('natal', 'natal.jpg', 'Natal', '6 dias / 5 noites', 'Saindo de São Paulo', 7.8, 3, 'Economize R$235', 1127, 511, 'linear-gradient(135deg,#1b6fb3,#7fc4d6)', 'Dunas, falésias e praias quase desertas, com operadores que usam buggys elétricos onde é permitido.', 'Operadores com veículos elétricos e respeito às áreas de preservação das dunas.', 'Setembro a fevereiro', 'Quente e seco, muito sol');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('natal', 1, 'Dia 1 — Chegada e jantar à beira-mar em Ponta Negra.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('natal', 2, 'Dias 2 a 3 — Passeio às dunas de Genipabu e praia de Pipa.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('natal', 3, 'Dias 4 a 5 — Dias livres para descanso e mergulho.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('natal', 4, 'Dia 6 — Retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('natal', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('natal', 2, '5 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('natal', 3, 'Passeio às dunas');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('natal', 4, 'Traslado compartilhado');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('natal', 1, 'Buggy opcional');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('natal', 2, 'Refeições');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('natal', 3, 'Seguro viagem');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('natal', 1, 'Dunas de Genipabu');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('natal', 2, 'Praia de Pipa');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('natal', 3, 'Passeio de buggy');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('natal', 'Juliana S.', 4, 'Dunas incríveis. O passeio de buggy é imperdível.');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('natal', 'Rafael N.', 5, 'Praias quase desertas, perfeito para descansar.');

-- São Paulo
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('sp', 'sp.jpg', 'São Paulo', '4 dias / 3 noites', 'Saindo do Rio de Janeiro', 7.8, 3, 'Oferta destaque', 611, 314, 'linear-gradient(135deg,#2a5e86,#8fb8d6)', 'Cultura, gastronomia e parques urbanos, com hotel bem servido por metrô para você deixar o carro de lado.', 'Hotel a poucos passos do metrô e roteiro pensado para transporte público.', 'O ano todo', 'Subtropical, variações ao longo do dia');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('sp', 1, 'Dia 1 — Chegada e jantar na Vila Madalena.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('sp', 2, 'Dia 2 — Avenida Paulista, MASP e Parque Trianon a pé.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('sp', 3, 'Dia 3 — Mercadão, centro histórico e Pinacoteca.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('sp', 4, 'Dia 4 — Manhã livre e retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('sp', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('sp', 2, '3 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('sp', 3, 'Cartão de transporte público recarregado');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('sp', 4, 'Mapa de roteiros a pé');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('sp', 1, 'Ingressos de museus');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('sp', 2, 'Refeições');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('sp', 3, 'Transporte além do cartão');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('sp', 1, 'Avenida Paulista e MASP');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('sp', 2, 'Mercadão e centro histórico');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('sp', 3, 'Gastronomia da Vila Madalena');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('sp', 'Bruno A.', 4, 'Ótimo para quem curte cultura e comida boa.');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('sp', 'Helena F.', 5, 'Hotel super bem localizado, tudo perto do metrô.');

-- Bonito
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('bonito', 'bonito.jpg', 'Bonito', '5 dias / 4 noites', 'Saindo de São Paulo', 9.4, 4, 'Baixo impacto', 1340, 690, 'linear-gradient(135deg,#1f8a5b,#5fc4a0)', 'Rios de água cristalina e grutas, num destino que já controla a visitação por padrão para proteger os ecossistemas.', 'Atrativos com limite diário oficial de visitantes e guias credenciados obrigatórios.', 'Março a outubro (água mais clara)', 'Quente, com chuvas no verão');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('bonito', 1, 'Dia 1 — Chegada e adaptação.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('bonito', 2, 'Dia 2 — Flutuação no Rio da Prata com guia credenciado.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('bonito', 3, 'Dia 3 — Gruta do Lago Azul e trilhas.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('bonito', 4, 'Dia 4 — Dia livre para descanso.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('bonito', 5, 'Dia 5 — Retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('bonito', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('bonito', 2, '4 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('bonito', 3, 'Flutuação guiada');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('bonito', 4, 'Ingressos dos atrativos');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('bonito', 1, 'Passeios opcionais');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('bonito', 2, 'Refeições');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('bonito', 3, 'Equipamento de mergulho extra');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('bonito', 1, 'Flutuação no Rio da Prata');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('bonito', 2, 'Gruta do Lago Azul');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('bonito', 3, 'Trilhas ecológicas');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('bonito', 'Tiago L.', 5, 'A flutuação é surreal, parece aquário natural.');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('bonito', 'Camila P.', 5, 'Destino que respeita o meio ambiente de verdade.');

-- Fernando de Noronha
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('fernando', 'fernando.jpg', 'Fernando de Noronha', '6 dias / 5 noites', 'Saindo do Recife', 9.6, 4, NULL, 2980, 1450, 'linear-gradient(135deg,#0c3a5e,#3a8fb0)', 'Um dos santuários ecológicos mais protegidos do país, com mergulho, trilhas e taxa de preservação ambiental inclusa.', 'Taxa de preservação ambiental inclusa e pousada com gestão de resíduos certificada.', 'Agosto a dezembro (mergulho)', 'Tropical, temperatura estável');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('fernando', 1, 'Dia 1 — Chegada e pôr do sol no Forte.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('fernando', 2, 'Dias 2 a 3 — Mergulho e Baía dos Porcos.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('fernando', 3, 'Dias 4 a 5 — Trilhas guiadas e praias preservadas.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('fernando', 4, 'Dia 6 — Retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('fernando', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('fernando', 2, '5 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('fernando', 3, 'Taxa de preservação ambiental');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('fernando', 4, 'Mergulho guiado');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('fernando', 1, 'Taxa de mergulho avançado');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('fernando', 2, 'Refeições');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('fernando', 3, 'Passeios de barco extras');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('fernando', 1, 'Baía dos Porcos');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('fernando', 2, 'Mergulho com tartarugas');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('fernando', 3, 'Mirante dos Dois Irmãos');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('fernando', 'Fernanda G.', 5, 'O paraíso existe e fica em Noronha. Inesquecível.');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('fernando', 'Lucas D.', 5, 'Caro, mas vale cada real. Natureza preservada.');

-- Gramado
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('gramado', 'gramado.jpg', 'Gramado', '4 dias / 3 noites', 'Saindo de São Paulo', 8.9, 3, NULL, 890, 432, 'linear-gradient(135deg,#2b6f6f,#7fb8b0)', 'Clima de serra, parques e gastronomia, com pousada aconchegante e roteiro caminhável pelo centro.', 'Pousada com reuso de água e roteiro central a pé, sem necessidade de carro.', 'Junho a agosto (frio) ou dezembro (Natal Luz)', 'Serra, frio no inverno');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('gramado', 1, 'Dia 1 — Chegada e jantar no centro.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('gramado', 2, 'Dia 2 — Lago Negro e Mini Mundo a pé.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('gramado', 3, 'Dia 3 — Vale dos Vinhedos com transporte compartilhado.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('gramado', 4, 'Dia 4 — Manhã livre e retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('gramado', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('gramado', 2, '3 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('gramado', 3, 'Tour compartilhado ao Vale dos Vinhedos');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('gramado', 4, 'Traslado');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('gramado', 1, 'Degustações de vinho');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('gramado', 2, 'Refeições');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('gramado', 3, 'Ingressos de parques');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('gramado', 1, 'Lago Negro');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('gramado', 2, 'Vale dos Vinhedos');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('gramado', 3, 'Rua Coberta e gastronomia');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('gramado', 'Sandra R.', 5, 'Clima de serra perfeito, muito aconchegante.');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('gramado', 'Marcos V.', 4, 'Lindo no inverno. Leve casaco!');

-- Salvador
INSERT INTO pacotes (id, imagem, titulo, duracao, saida, nota, estrelas, destaque, preco, pontos, arte, resumo, impacto, melhor_epoca, clima) VALUES ('salvador', 'salvador.jpg', 'Salvador', '5 dias / 4 noites', 'Saindo de São Paulo', 8.2, 3, 'Economize R$180', 1050, 498, 'linear-gradient(135deg,#185f96,#6ea8d6)', 'História, praia e ritmo, com hospedagem no centro histórico e passeios a pé pelo Pelourinho.', 'Hospedagem em prédio histórico restaurado e roteiros a pé pelo centro.', 'Setembro a março', 'Tropical, quente o ano todo');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('salvador', 1, 'Dia 1 — Chegada e Pelourinho ao entardecer.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('salvador', 2, 'Dia 2 — Cidade Alta e Cidade Baixa pelo Elevador Lacerda.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('salvador', 3, 'Dias 3 a 4 — Praias do Porto da Barra e Farol da Barra.');
INSERT INTO pacote_roteiro (pacote_id, ordem, descricao) VALUES ('salvador', 4, 'Dia 5 — Retorno.');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('salvador', 1, 'Passagem aérea ida e volta');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('salvador', 2, '4 noites com café da manhã');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('salvador', 3, 'Tour histórico a pé');
INSERT INTO pacote_inclui (pacote_id, ordem, item) VALUES ('salvador', 4, 'Traslado compartilhado');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('salvador', 1, 'Passeios opcionais');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('salvador', 2, 'Refeições');
INSERT INTO pacote_nao_inclui (pacote_id, ordem, item) VALUES ('salvador', 3, 'Shows e eventos');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('salvador', 1, 'Pelourinho histórico');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('salvador', 2, 'Elevador Lacerda');
INSERT INTO pacote_destaques (pacote_id, ordem, item) VALUES ('salvador', 3, 'Praia do Porto da Barra');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('salvador', 'Patrícia L.', 5, 'História e cultura em cada esquina. Amei o Pelô.');
INSERT INTO pacote_avaliacoes (pacote_id, nome, estrelas, texto) VALUES ('salvador', 'Diego S.', 4, 'Cidade vibrante, comida maravilhosa.');

-- ------------------------------------------------------------
--  Para criar um administrador: cadastre-se no site e execute
--    UPDATE usuarios SET admin = TRUE WHERE email = 'seu@email.com';
-- ------------------------------------------------------------
