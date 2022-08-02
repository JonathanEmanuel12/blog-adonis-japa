# blog-adonis-japa

#### Api simples que simula um blog (usuários e postagens) com o intuito de estudar testes funcionais com Adonis 5

Fiz este projeto com o intuito de estudar testes funcionais e unitários com Node, Adonis 5 e Japa.

#### Stack

- Node
- Adonis 5
- Japa
- Postgres
- Docker

#### Instruções para rodar

- Criar um arquivo .env e copiar o conteúdo de .env.example para ele.
- Rodar `docker-compose up -d` para subir o banco de dados Postgres.
- `node ace test` para rodar os testes e `node ace serve` para rodar a api. Nos dois casos é possível utilizar o --watch.


