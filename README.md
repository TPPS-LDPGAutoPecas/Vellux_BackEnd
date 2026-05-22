# SiteVellux Backend

Este é o repositório do backend para o projeto SiteVellux. Ele fornece a API e conecta-se ao banco de dados PostgreSQL.

## Tecnologias
- Node.js
- PostgreSQL
- Docker & Docker Compose

## Pré-requisitos

- Docker e Docker Compose instalados.

## Como rodar localmente com Docker

1. Na raiz do repositório (onde este arquivo está localizado), execute o comando para construir e subir os containers (backend e banco de dados):

```bash
docker-compose up -d --build
```

2. O backend estará disponível em `http://localhost:3000`.
3. O banco de dados PostgreSQL estará rodando na porta `5432`.

### Estrutura do Docker
- O container do banco de dados executará automaticamente o script `create-tables.sql` na inicialização, caso o volume ainda não tenha sido populado.
