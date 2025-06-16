const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'rezende123',
  port: 5432,
});

// ROTA PRINCIPAL
app.get('/', (req, res) => {
  res.send('Nosso servidor está funcionando!');
});

// ROTA DE LOGIN
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const r = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (r.rows.length > 0) {
      const u = r.rows[0];
      if (u.senha === senha) {
        res.json({ success: true, message: `Login bem-sucedido! Bem-vindo, ${u.nome}!`, id: u.id, nome: u.nome, nivel_acesso: u.nivel_acesso });
      } else { res.json({ success: false, message: 'Email ou senha inválidos' }); }
    } else { res.json({ success: false, message: 'Email ou senha inválidos' }); }
  } catch (e) { console.error('Erro no login:', e); res.status(500).send('Erro no servidor'); }
});

// ROTAS DE USUÁRIOS
app.get('/api/usuarios', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, nome, email, nivel_acesso FROM usuarios ORDER BY nome ASC');
    res.json(r.rows);
  } catch (e) { console.error('Erro ao buscar usuários:', e); res.status(500).json({ message: 'Erro ao buscar usuários.' }); }
});

app.get('/api/colaboradores', async (req, res) => {
  try {
    const r = await pool.query("SELECT id, nome FROM usuarios WHERE nivel_acesso = 'colaborador' ORDER BY nome ASC");
    res.json(r.rows);
  } catch (e) { console.error('Erro ao buscar colaboradores:', e); res.status(500).json({ message: 'Erro ao buscar colaboradores.' }); }
});

app.put('/api/usuarios/:id/nivel-acesso', async (req, res) => {
  const { id } = req.params;
  const { novo_nivel } = req.body;
  try {
    const r = await pool.query('UPDATE usuarios SET nivel_acesso = $1 WHERE id = $2 RETURNING id, nome, nivel_acesso', [novo_nivel, id]);
    if (r.rows.length > 0) { res.json({ success: true, message: 'Nível de acesso atualizado!' }); }
    else { res.status(404).json({ success: false, message: 'Usuário não encontrado.' }); }
  } catch (e) { console.error('Erro ao atualizar nível de acesso:', e); res.status(500).json({ success: false, message: 'Erro ao atualizar.' }); }
});

// ROTAS DE SUGESTÕES
app.post('/api/sugestoes', async (req, res) => {
  const { autor_id, setor, problema, solucao, observacoes } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO sugestoes (autor_id, setor_impactado, problema_detectado, solucao_proposta, observacoes, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [autor_id, setor, problema, solucao, observacoes, 'pendente']
    );
    res.json({ success: true, message: 'Sugestão enviada com sucesso!', sugestao: r.rows[0] });
  } catch (e) { console.error('Erro ao salvar sugestão:', e); res.status(500).json({ success: false, message: 'Falha ao enviar sugestão.' }); }
});

app.get('/api/sugestoes/usuario/:id', async (req, res) => {
  const { id } = req.params; 
  try {
    const r = await pool.query( 'SELECT * FROM sugestoes WHERE autor_id = $1 ORDER BY id DESC', [id] );
    res.json(r.rows);
  } catch (e) { console.error('Erro ao buscar sugestões do usuário:', e); res.status(500).json({ message: 'Erro ao buscar sugestões.' }); }
});

app.get('/api/sugestoes-pendentes', async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM sugestoes WHERE status = 'pendente' ORDER BY id ASC");
    res.json(r.rows);
  } catch (e) { console.error('Erro ao buscar sugestões pendentes:', e); res.status(500).json({ message: 'Erro ao buscar sugestões.' }); }
});

app.get('/api/sugestoes-viaveis', async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM sugestoes WHERE status = 'viavel' ORDER BY id DESC");
    res.json(r.rows);
  } catch (e) { console.error('Erro ao buscar sugestões viáveis:', e); res.status(500).json({ message: 'Erro ao buscar sugestões.' }); }
});

app.get('/api/sugestoes/revisao-admin', async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM sugestoes WHERE status = 'nao_viavel_em_analise' ORDER BY id ASC");
    res.json(r.rows);
  } catch (e) { console.error('Erro ao buscar sugestões para revisão:', e); res.status(500).json({ message: 'Erro ao buscar sugestões.' }); }
});

app.get('/api/sugestoes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query('SELECT * FROM sugestoes WHERE id = $1', [id]);
    if (r.rows.length > 0) { res.json(r.rows[0]); }
    else { res.status(404).json({ message: 'Sugestão não encontrada.' }); }
  } catch (e) { console.error('Erro ao buscar detalhes da sugestão:', e); res.status(500).json({ message: 'Erro ao buscar detalhes.' }); }
});

app.put('/api/sugestoes/:id/status', async (req, res) => {
  const { id } = req.params;
  const { novo_status, justificativa } = req.body;
  try {
    const r = await pool.query('UPDATE sugestoes SET status = $1, justificativa_nao_viavel = $2 WHERE id = $3 RETURNING *', [novo_status, justificativa, id]);
    if (r.rows.length > 0) { res.json({ success: true, message: 'Status atualizado com sucesso!', sugestao: r.rows[0] }); }
    else { res.status(404).json({ success: false, message: 'Sugestão não encontrada.' }); }
  } catch (e) { console.error('Erro ao atualizar status:', e); res.status(500).json({ success: false, message: 'Erro ao atualizar status.' }); }
});

app.put('/api/sugestoes/:id/admin-action', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  let novo_status = '', editada_flag = false;
  if (action === 'recuperar') { novo_status = 'pendente'; editada_flag = true; }
  else if (action === 'arquivar') { novo_status = 'rejeitada'; }
  else { return res.status(400).json({ success: false, message: 'Ação inválida.' }); }
  try {
    const r = await pool.query('UPDATE sugestoes SET status = $1, editada_pelo_admin = $2 WHERE id = $3 RETURNING *', [novo_status, editada_flag, id]);
    if (r.rows.length > 0) { res.json({ success: true, message: 'Ação do Admin registrada com sucesso!' }); }
    else { res.status(404).json({ success: false, message: 'Sugestão não encontrada.' }); }
  } catch (e) { console.error('Erro na ação do admin:', e); res.status(500).json({ success: false, message: 'Erro no servidor.' }); }
});

app.put('/api/sugestoes/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { problema, solucao, observacoes } = req.body;
  try {
    await pool.query('UPDATE sugestoes SET problema_detectado = $1, solucao_proposta = $2, observacoes = $3 WHERE id = $4', [problema, solucao, observacoes, id]);
    res.json({ success: true, message: 'Sugestão atualizada com sucesso!' });
  } catch (e) { console.error('Erro ao editar sugestão:', e); res.status(500).json({ success: false, message: 'Falha ao editar sugestão.' }); }
});

// ROTAS DE TAREFAS
app.post('/api/tarefas', async (req, res) => {
  const { sugestao_id, titulo, descricao, responsavel_id, prazo } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const nT = await client.query('INSERT INTO tarefas (sugestao_id, titulo, descricao, responsavel_id, prazo, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [sugestao_id, titulo, descricao, responsavel_id, prazo, 'a_fazer']);
    await client.query("UPDATE sugestoes SET status = 'em_execucao' WHERE id = $1 AND status = 'viavel'", [sugestao_id]);
    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Tarefa criada e sugestão atualizada!', tarefa: nT.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro na transação de criar tarefa:', e);
    res.status(500).json({ success: false, message: 'Falha ao criar tarefa.' });
  } finally { client.release(); }
});

app.get('/api/tarefas/usuario/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const r = await pool.query('SELECT * FROM tarefas WHERE responsavel_id = $1 ORDER BY prazo ASC', [id]);
        res.json(r.rows);
    } catch (e) { console.error('Erro ao buscar tarefas do usuário:', e); res.status(500).json({ message: 'Erro ao buscar tarefas.' }); }
});

app.get('/api/tarefas-delegadas', async (req, res) => {
  try {
    const query = `SELECT t.id, t.titulo, t.status, t.prazo, u.nome AS nome_responsavel FROM tarefas t JOIN usuarios u ON t.responsavel_id = u.id WHERE t.status <> 'concluido' ORDER BY t.prazo ASC;`;
    const r = await pool.query(query);
    res.json(r.rows);
  } catch (e) { console.error('Erro ao buscar tarefas delegadas:', e); res.status(500).json({ message: 'Erro ao buscar tarefas.' }); }
});

app.get('/api/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    if (r.rows.length > 0) { res.json(r.rows[0]); }
    else { res.status(404).json({ message: 'Tarefa não encontrada.' }); }
  } catch (e) { console.error('Erro ao buscar detalhes da tarefa:', e); res.status(500).json({ message: 'Erro ao buscar detalhes da tarefa.' }); }
});

app.put('/api/tarefas/:id/status', async (req, res) => {
  const { id } = req.params;
  const { novo_status, motivo_parada } = req.body;
  try {
    const r = await pool.query('UPDATE tarefas SET status = $1, motivo_parada = $2 WHERE id = $3 RETURNING *', [novo_status, motivo_parada, id]);
    if (r.rows.length > 0) { res.json({ success: true, message: 'Status da tarefa atualizado!' }); }
    else { res.status(404).json({ success: false, message: 'Tarefa não encontrada.' }); }
  } catch (e) { console.error('Erro ao atualizar status da tarefa:', e); res.status(500).json({ message: 'Erro no servidor.' }); }
});

// --- Inicia o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando e escutando na porta http://localhost:${port}`);
});