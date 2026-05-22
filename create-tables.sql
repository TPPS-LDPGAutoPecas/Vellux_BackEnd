-- =========================
-- TABELA: USUARIO
-- =========================
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('ADMIN', 'CLIENTE', 'MECANICO')),
    ativo BOOLEAN DEFAULT TRUE
);

-- =========================
-- TABELA: VEICULO
-- =========================
CREATE TABLE IF NOT EXISTS veiculo (
    id_veiculo SERIAL PRIMARY KEY,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    ano INT,
    placa VARCHAR(10) UNIQUE,
    id_cliente INT NOT NULL,
    CONSTRAINT fk_veiculo_cliente
        FOREIGN KEY (id_cliente) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

-- =========================
-- TABELA: SERVICO
-- =========================
CREATE TABLE IF NOT EXISTS servico (
    id_servico SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco_base NUMERIC(10,2),
    ativo BOOLEAN DEFAULT TRUE
);

-- =========================
-- TABELA: AGENDAMENTO
-- =========================
CREATE TABLE IF NOT EXISTS agendamento (
    id_agendamento SERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(50),
    id_cliente INT NOT NULL,
    id_veiculo INT NOT NULL,
    CONSTRAINT fk_agendamento_cliente
        FOREIGN KEY (id_cliente) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_agendamento_veiculo
        FOREIGN KEY (id_veiculo) REFERENCES veiculo(id_veiculo)
);

-- =========================
-- TABELA: ORDEM_SERVICO
-- =========================
CREATE TABLE IF NOT EXISTS ordem_servico (
    id_ordem SERIAL PRIMARY KEY,
    status VARCHAR(50),
    data_inicio TIMESTAMP,
    data_fim TIMESTAMP,
    id_agendamento INT UNIQUE,
    id_mecanico INT,
    CONSTRAINT fk_ordem_agendamento
        FOREIGN KEY (id_agendamento) REFERENCES agendamento(id_agendamento),
    CONSTRAINT fk_ordem_mecanico
        FOREIGN KEY (id_mecanico) REFERENCES usuario(id_usuario)
);

-- =========================
-- TABELA: ORCAMENTO
-- =========================
CREATE TABLE IF NOT EXISTS orcamento (
    id_orcamento SERIAL PRIMARY KEY,
    valor_total NUMERIC(10,2),
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aprovado BOOLEAN,
    id_ordem INT NOT NULL,
    CONSTRAINT fk_orcamento_ordem
        FOREIGN KEY (id_ordem) REFERENCES ordem_servico(id_ordem)
        ON DELETE CASCADE
);

-- =========================
-- TABELA: ITEM_SERVICO (N:N)
-- =========================
CREATE TABLE IF NOT EXISTS item_servico (
    id_item SERIAL PRIMARY KEY,
    id_ordem INT NOT NULL,
    id_servico INT NOT NULL,
    quantidade INT DEFAULT 1,
    valor NUMERIC(10,2),
    CONSTRAINT fk_item_ordem
        FOREIGN KEY (id_ordem) REFERENCES ordem_servico(id_ordem)
        ON DELETE CASCADE,
    CONSTRAINT fk_item_servico
        FOREIGN KEY (id_servico) REFERENCES servico(id_servico)
);

-- =========================
-- TABELA: NOTIFICACAO
-- =========================
CREATE TABLE IF NOT EXISTS notificacao (
    id_notificacao SERIAL PRIMARY KEY,
    mensagem TEXT,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

-- =========================
-- TABELA: AVALIACAO
-- =========================
CREATE TABLE IF NOT EXISTS avaliacao (
    id_avaliacao SERIAL PRIMARY KEY,
    nota INT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INT NOT NULL,
    id_ordem INT NOT NULL,
    CONSTRAINT fk_avaliacao_cliente
        FOREIGN KEY (id_cliente) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_avaliacao_ordem
        FOREIGN KEY (id_ordem) REFERENCES ordem_servico(id_ordem)
        ON DELETE CASCADE
);

-- =========================
-- TABELA: CONFIGURACAO
-- =========================
CREATE TABLE IF NOT EXISTS configuracao (
    id_config SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT
);