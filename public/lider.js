document.addEventListener('DOMContentLoaded', () => {
    const pendentesDiv = document.getElementById('lista-sugestoes-pendentes');
    const viaveisDiv = document.getElementById('lista-sugestoes-viaveis');
    const tarefasDiv = document.getElementById('lista-tarefas-delegadas');

    async function carregarSugestoes(url, container, tipo) {
        if (!container) return;
        try {
            const response = await fetch(url);
            const sugestoes = await response.json();
            if (sugestoes.length === 0) {
                container.innerHTML = `<p>Nenhuma ${tipo} encontrada.</p>`;
            } else {
                container.innerHTML = sugestoes.map(sugestao => {
                    // Lógica para adicionar a etiqueta de edição
                    const editadaBadge = sugestao.editada_pelo_admin 
                        ? '<span class="editado-badge">Revisada pelo Admin</span>' 
                        : '';

                    return `
                        <a href="/sugestao-detalhe.html?id=${sugestao.id}" class="sugestao-link">
                            <div class="sugestao-item status-${sugestao.status.replace(/\s+/g, '-')}">
                                <strong>
                                    ${sugestao.problema_detectado}
                                    ${editadaBadge}
                                </strong>
                                <p>Setor: ${sugestao.setor_impactado} | Status: <strong>${sugestao.status}</strong></p>
                            </div>
                        </a>
                    `;
                }).join('');
            }
        } catch (error) { container.innerHTML = `<p>Erro ao carregar sugestões.</p>`; }
    }

    async function carregarTarefasDelegadas() {
        if (!tarefasDiv) return;
        try {
            const response = await fetch('/api/tarefas-delegadas');
            const tarefas = await response.json();
            if (tarefas.length === 0) {
                tarefasDiv.innerHTML = '<p>Nenhuma tarefa em andamento.</p>';
            } else {
                tarefasDiv.innerHTML = tarefas.map(tarefa => `
                    <a href="/tarefa-detalhe.html?id=${tarefa.id}" class="sugestao-link">
                        <div class="sugestao-item status-${tarefa.status}">
                            <strong>${tarefa.titulo}</strong>
                            <p>Responsável: ${tarefa.nome_responsavel} | Status: <strong>${tarefa.status}</strong></p>
                        </div>
                    </a>
                `).join('');
            }
        } catch (error) { tarefasDiv.innerHTML = '<p>Erro ao carregar tarefas.</p>'; }
    }

    carregarSugestoes('/api/sugestoes-pendentes', pendentesDiv, 'sugestão pendente');
    carregarSugestoes('/api/sugestoes-viaveis', viaveisDiv, 'sugestão aprovada');
    carregarTarefasDelegadas();
});