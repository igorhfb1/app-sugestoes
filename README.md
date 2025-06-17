# Documentação do Aplicativo de Sugestões e Melhoria Contínua

Este documento descreve a arquitetura, funcionalidades e estrutura do código do aplicativo de Gestão de Sugestões e Melhoria Contínua, desenvolvido com Node.js (Express), PostgreSQL e JavaScript/HTML/CSS puro no frontend.

## Sumário
1.  Visão Geral do Projeto
2.  Estrutura do Projeto
3.  Configuração do Ambiente
4.  Estrutura do Banco de Dados
5.  Backend (Node.js - `index.js`)
    * Configuração
    * Rotas de Autenticação e Usuários
    * Rotas de Sugestões
    * Rotas de Tarefas
    * Rotas de Notificações
6.  Frontend (HTML, CSS, JavaScript)
    * Arquivos Comuns
    * Páginas de Autenticação
    * Páginas de Painel
    * Páginas de Gestão
    * Páginas de Detalhes
    * Página Meu Perfil
7.  Próximos Passos (Funcionalidades a Implementar)

---

## 1. Visão Geral do Projeto

O aplicativo de Gestão de Sugestões e Melhoria Contínua é uma plataforma que permite que colaboradores registrem ideias e problemas, que são então avaliados por líderes e, se aprovados, transformados em tarefas delegáveis. O sistema inclui um fluxo de trabalho com diferentes níveis de acesso (Colaborador, Líder, Administrador) e funcionalidades como cadastro de usuários com aprovação, upload de anexos, notificações e gestão de perfil.

## 2. Estrutura do Projeto

A estrutura do projeto é organizada da seguinte forma:

app_sugestoes/
├── node_modules/         # Dependências do Node.js
├── public/               # Arquivos estáticos (frontend)
│   ├── admin.html
│   ├── admin.js
│   ├── auth.js           # Lógica de autenticação e proteção de rotas (frontend)
│   ├── cadastro.html
│   ├── cadastro.js
│   ├── colaborador.html
│   ├── colaborador.js
│   ├── criar-tarefa.html
│   ├── criar-tarefa.js
│   ├── estilos.css       # Estilos CSS globais
│   ├── gerenciar-usuarios.html
│   ├── gerenciar-usuarios.js
│   ├── lider.html
│   ├── lider.js
│   ├── login.html
│   ├── login.js
│   ├── logout.js         # Lógica de logout
│   ├── meu-perfil.html
│   ├── meu-perfil.js     # Lógica da página de perfil do usuário
│   ├── nova-sugestao.html
│   ├── nova-sugestao.js
│   ├── sugestao-detalhe.html
│   ├── sugestao-detalhe.js
│   ├── tarefa-detalhe.html
│   ├── tarefa-detalhe.js
│   ├── uploads/          # Pasta para arquivos enviados (fotos de perfil, anexos de sugestão)
│   │   └── default-avatar.png # Imagem de avatar padrão
│   ├── utils.js          # Funções utilitárias reutilizáveis
│   └── validar-tarefa.html
│   └── validar-tarefa.js
├── .gitignore            # Arquivos e pastas a serem ignorados pelo Git
├── index.js              # Servidor Node.js (backend)
├── package-lock.json     # Gerenciamento de dependências
└── package.json          # Metadados do projeto e dependências


## 3. Configuração do Ambiente

Para rodar o aplicativo, siga os passos abaixo:

1.  **Pré-requisitos:**
    * Node.js (versão 18 ou superior recomendada).
    * PostgreSQL (servidor de banco de dados).
    * Cliente de banco de dados (pgAdmin, DBeaver, ou psql) para gerenciar o banco.

2.  **Configuração do Banco de Dados PostgreSQL:**
    * Crie um banco de dados com o nome `postgres` (ou ajuste no `index.js`).
    * Certifique-se de que o usuário `postgres` tem a senha `rezende123` (ou ajuste no `index.js`).
    * Execute os comandos SQL de criação das tabelas (ver Seção 4).

3.  **Instalação das Dependências:**
    * Navegue até a pasta `app_sugestoes` no seu terminal.
    * Instale as dependências Node.js:
        ```bash
        npm install
        ```
    * Instale `multer` e `sharp` (para upload de arquivos e otimização de imagens):
        ```bash
        npm install multer sharp
        ```

4.  **Criação da Pasta de Uploads:**
    * Dentro da pasta `public/`, crie uma pasta chamada `uploads`. O `index.js` tentará criá-la automaticamente, mas é bom verificar.

5.  **Criação de Usuário Administrador Inicial:**
    * Após criar as tabelas (Seção 4), insira manualmente um usuário administrador no banco de dados para poder gerenciar o sistema. Exemplo:
        ```sql
        INSERT INTO usuarios (nome, email, senha, nivel_acesso, status_cadastro, ativo)
        VALUES ('Admin Master', 'admin@meusistema.com', 'admin123', 'admin', 'aprovado', TRUE);
        ```

6.  **Inicialização do Servidor:**
    * No terminal, na pasta `app_sugestoes`, execute:
        ```bash
        node index.js
        ```
    * O servidor estará rodando em `http://localhost:3000`.

## 4. Estrutura do Banco de Dados

O aplicativo utiliza um banco de dados PostgreSQL com as seguintes tabelas:

### Tabela `usuarios`

Armazena informações sobre os usuários do sistema.

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso VARCHAR(50) NOT NULL DEFAULT 'colaborador', -- 'colaborador', 'lider', 'admin'
    status_cadastro VARCHAR(50) DEFAULT 'pendente',           -- 'pendente', 'aprovado', 'rejeitado'
    ativo BOOLEAN DEFAULT TRUE,                               -- TRUE (ativo) / FALSE (inativo)
    foto_perfil_url VARCHAR(255)                              -- Caminho para a foto de perfil (ex: /uploads/perfil-1.webp)
);
Tabela sugestoes
Armazena as sugestões de melhoria enviadas pelos colaboradores.

SQL

CREATE TABLE sugestoes (
    id SERIAL PRIMARY KEY,
    autor_id INT NOT NULL,
    setor_impactado VARCHAR(255) NOT NULL,
    problema_detectado TEXT NOT NULL,
    solucao_proposta TEXT,
    observacoes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- 'pendente', 'viavel', 'nao_viavel_em_analise', 'em_execucao', 'rejeitada', 'concluido'
    justificativa_nao_viavel TEXT,                  -- Justificativa para sugestão não viável pelo líder
    editada_pelo_admin BOOLEAN DEFAULT FALSE,       -- Indica se a sugestão foi editada pelo admin
    anexo_url VARCHAR(255),                         -- Caminho para o anexo da sugestão (ex: /uploads/sugestao-123.pdf)
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_autor_sugestao
        FOREIGN KEY(autor_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT -- Impede exclusão de usuário com sugestões
);
Tabela tarefas
Armazena as tarefas geradas a partir de sugestões aprovadas.

SQL

CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    sugestao_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    responsavel_id INT NOT NULL,
    prazo DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'a_fazer', -- 'a_fazer', 'em_andamento', 'parado', 'aguardando_validacao', 'concluido'
    motivo_parada TEXT,                              -- Justificativa para tarefa parada
    justificativa_rejeicao TEXT,                     -- Justificativa para rejeição da conclusão pelo líder (campo não utilizado ativamente no frontend atualmente)
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sugestao_tarefa
        FOREIGN KEY(sugestao_id)
        REFERENCES sugestoes(id)
        ON DELETE RESTRICT, -- Impede exclusão de sugestão com tarefas
    CONSTRAINT fk_responsavel_tarefa
        FOREIGN KEY(responsavel_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT -- Impede exclusão de usuário com tarefas
);
Tabela notificacoes
Armazena notificações para os usuários.

SQL

CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    mensagem TEXT NOT NULL,
    link VARCHAR(255),
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_notificacao
        FOREIGN KEY(usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE -- Exclui notificações se o usuário for excluído
);
5. Backend (Node.js - index.js)
O index.js é o coração do backend, utilizando Express.js para as rotas e pg para interação com o PostgreSQL. Multer e Sharp são usados para upload e otimização de imagens.

Configuração
Servidor Express: Inicializa o Express e configura a porta (3000).
Middleware: express.static('public') para servir arquivos frontend, express.json() para parsing de JSON no corpo das requisições.
PostgreSQL Pool: Configura a conexão com o banco de dados.
Multer (Configuração):
uploadsDir: Define a pasta /public/uploads para salvar arquivos.
multer.memoryStorage(): Configurado para armazenar arquivos em memória (req.file.buffer) antes do processamento, evitando erros de bloqueio de arquivo (EBUSY).
upload: Instância do Multer para ser usada como middleware.
Servir Uploads Estaticamente: app.use('/uploads', express.static(uploadsDir)) permite que arquivos na pasta uploads sejam acessados via URL (ex: http://localhost:3000/uploads/minhafoto.webp).
Função tryUnlink: Uma função auxiliar assíncrona para tentar remover arquivos de forma robusta, com atrasos e múltiplas tentativas em caso de bloqueio, útil para a exclusão de fotos antigas.
Rotas de Autenticação e Usuários
POST /login:
Autentica um usuário com email e senha.
Retorna id, nome, nivel_acesso se o login for bem-sucedido.
Validação: Verifica status_cadastro (aprovado, pendente, rejeitado) e ativo (TRUE/FALSE) antes de permitir o login.
POST /api/cadastro:
Registra um novo usuário com nome, email, senha.
Define nivel_acesso como 'colaborador', status_cadastro como 'pendente' e ativo como TRUE por padrão.
Verifica se o email já existe.
GET /api/user/me:
Verifica a sessão do usuário logado (usando X-User-Id e X-User-Nivel do header).
Retorna os dados completos do usuário (id, nome, email, papel, status_cadastro, ativo, foto_perfil_url).
Validação: Garante que o usuário está aprovado e ativo para manter a sessão.
GET /api/usuarios:
Retorna uma lista de todos os usuários (id, nome, email, nivel_acesso, status_cadastro, ativo). Usado para gerenciamento pelo Admin.
GET /api/colaboradores:
Retorna uma lista de usuários com nivel_acesso='colaborador' que estão aprovados e ativos. Usado para delegar tarefas.
PUT /api/usuarios/:id/nivel-acesso:
Atualiza o nivel_acesso de um usuário específico.
PUT /api/usuarios/:id/status-cadastro:
Atualiza o status_cadastro de um usuário (Admin aprova/rejeita).
PUT /api/usuarios/:id/status-ativo:
Atualiza o status ativo de um usuário (Admin inativa/ativa).
PUT /api/usuarios/:id/foto-perfil (com upload.single('foto')):
Recebe um arquivo de imagem (foto).
Usa sharp para redimensionar (150x150px) e otimizar a imagem para webp (qualidade 75%).
Salva a imagem otimizada na pasta public/uploads com um nome único.
Tenta remover a foto antiga do usuário da pasta uploads (se existir e não for o avatar padrão).
PUT /api/usuarios/:id/alterar-senha:
Permite que um usuário altere sua senha.
Valida a senha_atual antes de atualizar para a nova_senha.
Rotas de Sugestões
POST /api/sugestoes (com upload.single('anexo')):
Registra uma nova sugestão com autor_id, setor_impactado, problema_detectado, solucao_proposta, observacoes.
Salva o anexo (se enviado) na pasta uploads e registra anexo_url.
Notificação: Cria notificações para todos os admins e lideres ativos e aprovados.
GET /api/sugestoes/usuario/:id:
Retorna todas as sugestões criadas por um usuario_id específico.
GET /api/sugestoes-pendentes:
Retorna sugestões com status='pendente'.
GET /api/sugestoes-viaveis:
Retorna sugestões com status='viavel'.
GET /api/sugestoes/revisao-admin:
Retorna sugestões com status='nao_viavel_em_analise' (para revisão do Admin).
GET /api/sugestoes/:id:
Retorna os detalhes de uma sugestão específica, incluindo anexo_url.
PUT /api/sugestoes/:id/status:
Atualiza o status da sugestão (ex: viavel, nao_viavel_em_analise).
Pode salvar justificativa_nao_viavel.
Notificação: Cria notificação para o autor da sugestão sobre a mudança de status.
PUT /api/sugestoes/:id/admin-action:
Permite que o Admin recuperar (volta para pendente) ou arquivar (muda para rejeitada) uma sugestão.
Notificação: Cria notificação para o autor da sugestão sobre a ação do Admin.
PUT /api/sugestoes/:id/edit:
Permite que o Admin edite o problema_detectado, solucao_proposta, observacoes de uma sugestão.
Rotas de Tarefas
POST /api/tarefas:
Cria uma nova tarefa vinculada a uma sugestão (sugestao_id), com titulo, descricao, responsavel_id e prazo.
Define status='a_fazer'.
Atualiza o status da sugestão associada para 'em_execucao'.
Notificação: Notifica o responsavel_id da tarefa.
GET /api/tarefas/usuario/:id:
Retorna todas as tarefas de um responsavel_id específico.
GET /api/tarefas-delegadas:
Retorna todas as tarefas delegadas (não concluídas) para o painel do Líder, incluindo o nome_responsavel.
GET /api/tarefas/:id:
Retorna os detalhes de uma tarefa específica, incluindo nome_responsavel.
PUT /api/tarefas/:id/status:
Atualiza o status de uma tarefa (em_andamento, parado, aguardando_validacao, concluido).
Pode salvar motivo_parada.
Se novo_status for aguardando_validacao, Notifica Líderes e Admins.
Atualiza o status da sugestão associada para concluido se a tarefa for concluída, ou em_execucao se estiver em andamento.
GET /api/tarefas-aguardando-validacao:
Retorna tarefas com status='aguardando_validacao' para o painel de validação do Líder.
Rotas de Notificações
GET /api/notificacoes/usuario/:id:
Retorna todas as notificações lida=FALSE para um usuario_id específico.
PUT /api/notificacoes/:id/marcar-lida:
Marca uma notificação específica como lida=TRUE.
6. Frontend (HTML, CSS, JavaScript)
O frontend é construído com HTML, CSS puro e JavaScript puro, sem frameworks. A interação com o backend é feita via fetch API.

Arquivos Comuns
public/estilos.css: Contém todos os estilos CSS globais para o aplicativo, incluindo estilos de formulários, botões, listas e tabelas. Possui estilos específicos para status-badge, editado-badge, rejeitada-badge e os contornos coloridos de perfil.
public/auth.js: Crucial para a segurança do frontend.
Verifica a sessão do usuário no localStorage e via GET /api/user/me.
Redireciona para /login.html se não estiver logado ou se o nível de acesso não for compatível com a página atual.
Preenche a foto de perfil e o nível de acesso no cabeçalho fixo das páginas (canto superior direito).
Adiciona as classes de contorno colorido (border-admin, border-lider, border-colaborador) à foto de perfil com base no nível do usuário.
Torna a foto de perfil no cabeçalho clicável, redirecionando para /meu-perfil.html.
public/logout.js: Atribuído ao botão "Sair do Sistema". Limpa os dados do localStorage (usuario_id, usuario_nome, usuario_nivel, usuario_foto_perfil_url) e redireciona para /login.html.
public/utils.js: Contém funções utilitárias reutilizáveis para o frontend.
definirLinkVoltar(linkElement, nivelAcesso): Define o href de um link "Voltar ao Painel" com base no nível de acesso do usuário.
Páginas de Autenticação
public/login.html: Formulário de login com campos de email e senha. Contém um link para cadastro.html.
public/login.js: Lida com o envio do formulário de login (POST /login), salva os dados do usuário no localStorage e redireciona para o painel correspondente ao nivel_acesso.
public/cadastro.html: Formulário para novos usuários solicitarem cadastro.
public/cadastro.js: Lida com o envio do formulário de cadastro (POST /api/cadastro), valida se as senhas coincidem e fornece feedback ao usuário.
Páginas de Painel
Estas são as páginas iniciais para cada tipo de usuário. Todas incluem o #header-perfil para a foto e status fixos.

public/colaborador.html: Painel do Colaborador.
Exibe "Minhas Sugestões Ativas", "Minhas Tarefas" e "Sugestões Arquivadas".
Contém um link para "+ Cadastrar Nova Sugestão".
Seção para "Suas Notificações" com contador.
public/colaborador.js:
Carrega e exibe sugestões (/api/sugestoes/usuario/:id) e tarefas (/api/tarefas/usuario/:id) do usuário logado.
Carrega e exibe notificações não lidas (/api/notificacoes/usuario/:id).
Adiciona a tag rejeitada-badge às tarefas que foram rejeitadas pelo líder.
public/lider.html: Painel do Líder.
Exibe "Sugestões Pendentes de Análise", "Sugestões Aprovadas" e "Acompanhamento de Tarefas Delegadas".
Contém links para "+ Criar Nova Tarefa" e "Validar Tarefas Concluídas".
Seção para "Suas Notificações" com contador.
public/lider.js:
Carrega e exibe as sugestões pendentes (/api/sugestoes-pendentes), sugestões viáveis (/api/sugestoes-viaveis) e tarefas delegadas (/api/tarefas-delegadas).
Carrega e exibe notificações não lidas para o líder.
public/admin.html: Painel do Administrador.
Exibe "Sugestões Aguardando Análise Final".
Contém um link para "Gerenciar Usuários".
Seção para "Suas Notificações" com contador.
public/admin.js:
Carrega e exibe sugestões em revisão (/api/sugestoes/revisao-admin).
Páginas de Gestão
public/gerenciar-usuarios.html: Página para o Administrador gerenciar usuários.
public/gerenciar-usuarios.js:
Lista todos os usuários, incluindo status_cadastro e ativo.
Permite ao Admin alterar o nivel_acesso dos usuários.
Fornece botões para "Aprovar"/"Rejeitar" cadastros pendentes e "Inativar"/"Ativar" usuários.
public/criar-tarefa.html: Formulário para o Líder criar uma nova tarefa a partir de uma sugestão aprovada.
public/criar-tarefa.js:
Carrega sugestões viáveis e colaboradores (/api/sugestoes-viaveis, /api/colaboradores).
Lida com o envio do formulário para criar uma nova tarefa (POST /api/tarefas).
Páginas de Detalhes
public/sugestao-detalhe.html: Exibe detalhes de uma sugestão.
Contém textareas para descrição, solução e observações.
Seção para "Anexo" com link para o arquivo.
Botões de ação para Líder (Viável/Não Viável) e Admin (Recuperar/Arquivar).
public/sugestao-detalhe.js:
Busca os detalhes da sugestão (/api/sugestoes/:id), incluindo anexo_url.
Preenche os campos e exibe o anexo se existir.
Lida com as ações dos botões (PUT /api/sugestoes/:id/status, PUT /api/sugestoes/:id/admin-action, PUT /api/sugestoes/:id/edit).
public/tarefa-detalhe.html: Exibe detalhes de uma tarefa.
Contém textareas para descrição e motivo de parada.
Botões de ação para Colaborador (Marcar como Em Execução/Marcar como Parada/Enviar para Validação do Líder).
Seção "Motivo de Parada" que aparece se a tarefa estiver parada.
public/tarefa-detalhe.js:
Busca os detalhes da tarefa (/api/tarefas/:id), incluindo nome_responsavel e motivo_parada.
Preenche os campos e exibe/oculta a seção de motivo de parada.
Lida com as ações dos botões (PUT /api/tarefas/:id/status).
public/validar-tarefa.html: Página para o Líder validar tarefas.
public/validar-tarefa.js:
Lista tarefas aguardando validação (/api/tarefas-aguardando-validacao).
Permite ao Líder "Validar e Concluir" ou "Rejeitar Conclusão" (PUT /api/tarefas/:id/status).
Página Meu Perfil
public/meu-perfil.html: Página onde o usuário pode visualizar e gerenciar seu perfil.
Exibe nome, email, nível de acesso, status de cadastro e status ativo.
Seção de "Foto de Perfil" com preview, input de arquivo e botão "Alterar Foto".
Seção "Ajustar Foto" com interface de cropper (img#image-to-crop, botões "Cortar e Enviar", "Cancelar"), inicialmente oculta.
Botão "Alterar Senha" que mostra/oculta o formulário de alteração de senha.
Formulário de "Alterar Senha" com campos para senha atual, nova senha e confirmação.
public/meu-perfil.js:
Busca e exibe os dados do perfil do usuário (GET /api/user/me), incluindo foto_perfil_url.
Funcionalidade de Cropper:
Ao selecionar um arquivo em input-foto-perfil, inicializa a biblioteca Cropper.js.
Obtém a imagem cropada como um Blob (arquivo) com dimensões específicas.
Envia o Blob para o backend (PUT /api/usuarios/:id/foto-perfil).
Controla a exibição/ocultação da interface do cropper.
Funcionalidade de Alterar Senha:
Lida com o envio do formulário de alteração de senha (PUT /api/usuarios/:id/alterar-senha).
Valida senhas (coincidência e comprimento).
Controla a exibição/ocultação do formulário de alteração de senha.
