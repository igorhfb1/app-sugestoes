# Documentação do Aplicativo de Sugestões e Melhoria Contínua

Este documento descreve a arquitetura, funcionalidades e estrutura do código do aplicativo de Gestão de Sugestões e Melhoria Contínua, desenvolvido com Node.js (Express), PostgreSQL e JavaScript/HTML/CSS puro no frontend.

## Sumário
- Visão Geral do Projeto
- Estrutura do Projeto
- Configuração do Ambiente
- Estrutura do Banco de Dados
- Backend (Node.js - index.js)
  - Configuração
  - Rotas de Autenticação e Usuários
  - Rotas de Sugestões
  - Rotas de Tarefas
  - Rotas de Notificações
- Frontend (HTML, CSS, JavaScript)
  - Arquivos Comuns
  - Páginas de Autenticação
  - Páginas de Painel
  - Páginas de Gestão
  - Páginas de Detalhes
  - Página Meu Perfil
- Próximos Passos (Funcionalidades a Implementar)

## 1. Visão Geral do Projeto

O aplicativo de Gestão de Sugestões e Melhoria Contínua é uma plataforma que permite que colaboradores registrem ideias e problemas, que são então avaliados por líderes e, se aprovados, transformados em tarefas delegáveis. O sistema inclui um fluxo de trabalho com diferentes níveis de acesso (Colaborador, Líder, Administrador) e funcionalidades como cadastro de usuários com aprovação, upload de anexos, notificações e gestão de perfil.

## 2. Estrutura do Projeto

```
app_sugestoes/
├── node_modules/         
├── public/               
│   ├── admin.html
│   ├── admin.js
│   ├── auth.js           
│   ├── cadastro.html
│   ├── cadastro.js
│   ├── colaborador.html
│   ├── colaborador.js
│   ├── criar-tarefa.html
│   ├── criar-tarefa.js
│   ├── estilos.css       
│   ├── gerenciar-usuarios.html
│   ├── gerenciar-usuarios.js
│   ├── lider.html
│   ├── lider.js
│   ├── login.html
│   ├── login.js
│   ├── logout.js         
│   ├── meu-perfil.html
│   ├── meu-perfil.js     
│   ├── nova-sugestao.html
│   ├── nova-sugestao.js
│   ├── sugestao-detalhe.html
│   ├── sugestao-detalhe.js
│   ├── tarefa-detalhe.html
│   ├── tarefa-detalhe.js
│   ├── uploads/          
│   │   └── default-avatar.png 
│   ├── utils.js          
│   └── validar-tarefa.html
│   └── validar-tarefa.js
├── .gitignore            
├── index.js              
├── package-lock.json     
└── package.json          
```

## 3. Configuração do Ambiente

### Pré-requisitos:
- Node.js (v18+)
- PostgreSQL
- Cliente de banco de dados (pgAdmin, DBeaver, psql)

### Configuração do Banco de Dados:
```sql
INSERT INTO usuarios (nome, email, senha, nivel_acesso, status_cadastro, ativo)
VALUES ('Admin Master', 'admin@meusistema.com', 'admin123', 'admin', 'aprovado', TRUE);
```

### Instalação e Execução:
```bash
npm install
npm install multer sharp
node index.js
```

Servidor: http://localhost:3000

## 4. Estrutura do Banco de Dados

### Tabela usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso VARCHAR(50) NOT NULL DEFAULT 'colaborador',
    status_cadastro VARCHAR(50) DEFAULT 'pendente',
    ativo BOOLEAN DEFAULT TRUE,
    foto_perfil_url VARCHAR(255)
);
```

### Tabela sugestoes
```sql
CREATE TABLE sugestoes (
    id SERIAL PRIMARY KEY,
    autor_id INT NOT NULL,
    setor_impactado VARCHAR(255) NOT NULL,
    problema_detectado TEXT NOT NULL,
    solucao_proposta TEXT,
    observacoes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    justificativa_nao_viavel TEXT,
    editada_pelo_admin BOOLEAN DEFAULT FALSE,
    anexo_url VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_autor_sugestao FOREIGN KEY(autor_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);
```

### Tabela tarefas
```sql
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    sugestao_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    responsavel_id INT NOT NULL,
    prazo DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'a_fazer',
    motivo_parada TEXT,
    justificativa_rejeicao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sugestao_tarefa FOREIGN KEY(sugestao_id) REFERENCES sugestoes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_responsavel_tarefa FOREIGN KEY(responsavel_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);
```

### Tabela notificacoes
```sql
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    mensagem TEXT NOT NULL,
    link VARCHAR(255),
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_notificacao FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```
## 5. Backend (Node.js - index.js)

O `index.js` é o coração do backend, utilizando **Express.js** para as rotas e `pg` para interação com o PostgreSQL. `Multer` e `Sharp` são usados para upload e otimização de imagens.

## Configuração

- **Servidor Express**: Inicializa o Express e configura a porta (3000).
- **Middleware**:
  - `express.static('public')`: serve arquivos do frontend.
  - `express.json()`: parsing de JSON no corpo das requisições.
- **PostgreSQL Pool**: Configura a conexão com o banco de dados.
- **Multer (Configuração)**:
  - `uploadsDir`: Define a pasta `/public/uploads` para salvar arquivos.
  - `multer.memoryStorage()`: Armazena arquivos em memória (`req.file.buffer`).
  - `upload`: Instância do Multer como middleware.
- **Servir Uploads Estaticamente**: `app.use('/uploads', express.static(uploadsDir))`
- **Função `tryUnlink`**: Auxiliar para remover arquivos de forma robusta.

## Rotas de Autenticação e Usuários

### `POST /login`
Autentica usuário e retorna `id`, `nome`, `nivel_acesso`. Valida `status_cadastro` e `ativo`.

### `POST /api/cadastro`
Registra novo usuário com status `pendente` e nível `colaborador`. Verifica duplicidade de email.

### `GET /api/user/me`
Verifica sessão via headers. Retorna dados completos do usuário.

### `GET /api/usuarios`
Lista todos os usuários.

### `GET /api/colaboradores`
Lista colaboradores ativos e aprovados.

### `PUT /api/usuarios/:id/nivel-acesso`
Atualiza o `nivel_acesso`.

### `PUT /api/usuarios/:id/status-cadastro`
Atualiza o `status_cadastro`.

### `PUT /api/usuarios/:id/status-ativo`
Ativa/Inativa um usuário.

### `PUT /api/usuarios/:id/foto-perfil`
Recebe `foto`, usa `sharp`, salva como `.webp`, e remove antiga.

### `PUT /api/usuarios/:id/alterar-senha`
Valida senha atual antes de atualizar nova senha.

## Rotas de Sugestões

### `POST /api/sugestoes`
Registra nova sugestão, com anexo opcional. Cria notificações.

### `GET /api/sugestoes/usuario/:id`
Sugestões de um usuário.

### `GET /api/sugestoes-pendentes`
Sugestões pendentes.

### `GET /api/sugestoes-viaveis`
Sugestões viáveis.

### `GET /api/sugestoes/revisao-admin`
Sugestões em análise final.

### `GET /api/sugestoes/:id`
Detalhes de uma sugestão.

### `PUT /api/sugestoes/:id/status`
Atualiza status e justifica se não viável. Cria notificação.

### `PUT /api/sugestoes/:id/admin-action`
Admin pode recuperar ou arquivar. Cria notificação.

### `PUT /api/sugestoes/:id/edit`
Edição de campos por Admin.

## Rotas de Tarefas

### `POST /api/tarefas`
Cria nova tarefa, vincula a sugestão e notifica responsável.

### `GET /api/tarefas/usuario/:id`
Tarefas de um colaborador.

### `GET /api/tarefas-delegadas`
Tarefas delegadas para o painel do Líder.

### `GET /api/tarefas/:id`
Detalhes de uma tarefa.

### `PUT /api/tarefas/:id/status`
Atualiza status. Se for `aguardando_validacao`, notifica Admin/Líder.

### `GET /api/tarefas-aguardando-validacao`
Tarefas que aguardam validação.

## Rotas de Notificações

### `GET /api/notificacoes/usuario/:id`
Retorna notificações não lidas.

### `PUT /api/notificacoes/:id/marcar-lida`
Marca notificação como lida.

## 6. Frontend (HTML, CSS, JavaScript)

Frontend feito com HTML, CSS e JavaScript puro.

## Arquivos Comuns

### `public/estilos.css`
Estilos globais.

### `public/auth.js`
Verifica sessão, redireciona se necessário, mostra dados do usuário e contorno colorido no perfil.

### `public/logout.js`
Limpa localStorage e redireciona para login.

### `public/utils.js`
Funções utilitárias (ex: `definirLinkVoltar`).

## Páginas de Autenticação

### `public/login.html` / `login.js`
Formulário e autenticação.

### `public/cadastro.html` / `cadastro.js`
Formulário de cadastro.

## Páginas de Painel

### `public/colaborador.html` / `colaborador.js`
Sugestões e tarefas do colaborador.

### `public/lider.html` / `lider.js`
Sugestões e tarefas delegadas.

### `public/admin.html` / `admin.js`
Sugestões aguardando revisão final.

## Páginas de Gestão

### `public/gerenciar-usuarios.html` / `gerenciar-usuarios.js`
Admin gerencia usuários.

### `public/criar-tarefa.html` / `criar-tarefa.js`
Líder cria tarefa a partir de sugestão.

## Páginas de Detalhes

### `public/sugestao-detalhe.html` / `sugestao-detalhe.js`
Visualiza e edita sugestão.

### `public/tarefa-detalhe.html` / `tarefa-detalhe.js`
Ações de tarefa, como marcar como parada, concluída, etc.

### `public/validar-tarefa.html` / `validar-tarefa.js`
Líder valida tarefa.

## Página de Perfil

### `public/meu-perfil.html` / `meu-perfil.js`
Gerencia perfil, altera senha e foto (com Cropper.js).

# Próximos Passos

- Cropar Foto de Perfil (ajustes no frontend).
- Remover Foto de Perfil (botão no frontend + rota DELETE ou PUT no backend).
- Notificações mais avançadas (toast, contador global, e-mail).
- Melhorias de UI/UX (fotos nas listas, filtros, paginação, etc).
- Relatórios e Dashboards.
- Recursos adicionais: comentários, anexos em tarefas, lembretes, arquivamento automático.


