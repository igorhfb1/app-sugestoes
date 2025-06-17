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
