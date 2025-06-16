document.addEventListener('DOMContentLoaded', () => {
    const nomeUsuario = localStorage.getItem('usuario_nome');
    const usuarioId = localStorage.getItem('usuario_id');
    const welcomeMessage = document.getElementById('welcome-message');
    const sugestoesAtivasDiv = document.getElementById('lista-sugestoes-ativas');
    const sugestoesArquivadasDiv = document.getElementById('lista-sugestoes-arquivadas');
    const tarefasDiv = document.getElementById('lista-minhas-tarefas');

    if (nomeUsuario) {
        welcomeMessage.textContent = `Painel de ${nomeUsuario}`;
    }

    async function carregarSugestoes() {
        if (!usuarioId || !sugestoesAtivasDiv || !sugestoesArquivadasDiv) return;
        try {
            const response = await fetch(`/api/sugestoes/usuario/${usuarioId}`);
            const sugestoes = await response.json();
            
            const ativas = sugestoes.filter(s => s.status !== 'rejeitada' && s.status !== 'concluido');
            const arquivadas = sugestoes.filter(s => s.status === 'rejeitada' || s.status === 'concluido');

            // Renderiza a lista de SUGESTÕES ATIVAS
            if (ativas.length === 0) {
                sugestoesAtivasDiv.innerHTML = '<p>Você não tem nenhuma sugestão ativa.</p>';
            } else {
                sugestoesAtivasDiv.innerHTML = ativas.map(sugestao => `
                    <a href="/sugestao-detalhe.html?id=${sugestao.id}" class="sugestao-link">
                        <div class="sugestao-item status-${sugestao.status.replace(/\s+/g, '-')}">
                            <strong>
                                ${sugestao.problema_detectado}
                                ${sugestao.editada_pelo_admin ? '<span class="editado-badge">Revisada pelo Admin</span>' : ''}
                            </strong>
                            <p>Setor: ${sugestao.setor_impactado} | Status: <strong>${sugestao.status}</strong></p>
                        </div>
                    </a>
                `).join('');
            }

            // Renderiza a lista de SUGESTÕES ARQUIVADAS
            if (arquivadas.length === 0) {
                sugestoesArquivadasDiv.innerHTML = '<p>Nenhuma sugestão arquivada.</p>';
            } else {
                sugestoesArquivadasDiv.innerHTML = arquivadas.map(sugestao => `
                    <a href="/sugestao-detalhe.html?id=${sugestao.id}" class="sugestao-link">
                        <div class="sugestao-item status-${sugestao.status}">
                            <strong>${sugestao.problema_detectado}</strong>
                            <p>Setor: ${sugestao.setor_impactado} | Status: <strong>${sugestao.status}</strong></p>
                        </div>
                    </a>
                `).join('');
            }
        } catch (error) { 
            console.error('Erro ao carregar sugestões:', error);
            sugestoesAtivasDiv.innerHTML = '<p>Erro ao carregar sugestões.</p>';
            sugestoesArquivadasDiv.innerHTML = '';
        }
    }

    async function carregarMinhasTarefas() {
        if (!usuarioId || !tarefasDiv) return;
        try {
            const response = await fetch(`/api/tarefas/usuario/${usuarioId}`);
            const tarefas = await response.json();
            if (tarefas.length === 0) {
                tarefasDiv.innerHTML = '<p>Você não tem nenhuma tarefa pendente. Bom trabalho!</p>';
            } else {
                tarefasDiv.innerHTML = tarefas.map(tarefa => `
                    <a href="/tarefa-detalhe.html?id=${tarefa.id}" class="sugestao-link">
                        <div class="sugestao-item status-${tarefa.status}">
                            <strong>${tarefa.titulo}</strong>
                            <p>Prazo: ${new Date(tarefa.prazo).toLocaleDateString()} | Status: <strong>${tarefa.status}</strong></p>
                        </div>
                    </a>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            tarefasDiv.innerHTML = '<p>Erro ao carregar tarefas.</p>';
        }
    }

    // Chama as funções para carregar tudo da página
    carregarSugestoes();
    carregarMinhasTarefas();
});