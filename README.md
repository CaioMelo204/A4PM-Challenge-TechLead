# 🍲 Aplicativo de Receitas 🚀

Bem-vindo(a) ao Aplicativo de Receitas, uma plataforma intuitiva para gerenciar e explorar suas receitas favoritas! Este projeto é construído com um frontend interativo e uma API de backend robusta, orquestrados por Docker para um ambiente de desenvolvimento e implantação simplificado.

## ✨ Visão Geral

Este aplicativo permite:

* Visualizar uma lista de receitas.

* Criar novas receitas com detalhes como ingredientes, modo de preparo, tempo e porções.

* Editar e deletar receitas existentes.

* Pesquisar e filtrar receitas por nome, categoria e outros critérios.

* Autenticação de usuários para acesso seguro.

## 💻 Tecnologias Utilizadas

**Frontend:**

* Vue.js 3 (com Composition API e Script Setup)

* Pinia (Gerenciamento de Estado)

* Vue Router (Navegação)

* Axios (Requisições HTTP)

* HTML5, CSS3

**Backend:**

* NestJS (com Express.js)

* MySQL (Banco de Dados)

* JWT (Autenticação)

* TypeORM (ORM)

* RestFull 

**Infraestrutura/Orquestração:**

* Docker

* Docker Compose

## 🚀 Como Iniciar o Projeto

Para colocar o aplicativo e a API em funcionamento localmente, siga estes passos simples usando Docker Compose.

### Pré-requisitos

Certifique-se de ter o [Docker Desktop](https://www.docker.com/products/docker-desktop/) (que inclui Docker Engine e Docker Compose) instalado em sua máquina.

### Passos de Inicialização

1. **Clone o Repositório:**

   ```
   git clone [<URL_DO_SEU_REPOSITORIO>](https://github.com/CaioMelo204/A4PM-Challenge-TechLead)
   cd <pasta-do-seu-projeto>
   
   ```

2. **Crie os arquivos `.env` (se necessário):**

   * Para o **backend**: Certifique-se de que a pasta `backend/` contenha um arquivo de configuração de ambiente se sua aplicação backend exigir (ex: `.env` com configurações do banco de dados). As variáveis `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_USERNAME`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV` são configuradas diretamente no `docker-compose.yml`.

   * Para o **frontend**: O `VITE_API_URL` já é passado via `docker-compose.yml`. Se precisar de outras variáveis de ambiente, configure seu projeto frontend para lê-las.

3. **Inicie os Serviços com Docker Compose:**
   Navegue até a pasta raiz do projeto (onde está o `docker-compose.yml`) no seu terminal e execute:

   ```
   docker compose up --build
   
   ```

   Este comando irá:

   * Construir as imagens Docker para o frontend e o backend (se ainda não existirem ou se houver mudanças).

   * Criar e iniciar os contêineres para o banco de dados MySQL, backend e frontend.

   * Configurar a rede `a4pm` para que os serviços possam se comunicar internamente.

   * Executar o script de inicialização do banco de dados (se houver um na pasta `init/`).

### Acessando a Aplicação

Após os contêineres serem iniciados (pode levar alguns minutos na primeira vez), você poderá acessar a aplicação e a API nos seguintes endereços:

* **Aplicativo Frontend:** 🌐 <http://localhost:5000>

* **API Backend:** ⚙️ <http://localhost:3000>

## ✅ Testes

Todos os testes unitários e de integração foram desenvolvidos usando **Vitest** e estão passando com sucesso! Isso garante a confiabilidade e o correto funcionamento das principais funcionalidades do aplicativo.

Para executar os testes do projeto, navegue até as pastas `frontend` ou `backend` (ou o local dos seus arquivos de teste) e execute o comando:

```
npm run test

```

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver sugestões, melhorias ou encontrar bugs, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📄 Licença

Este projeto está licenciado sob a licença MIT
