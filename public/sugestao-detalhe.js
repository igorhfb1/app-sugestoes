document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. PEGAR INFORMAÇÕES GERAIS ---
    const urlParams = new URLSearchParams(window.location.search);
    const sugestaoId = urlParams.get('id');
    const nivelAcesso = localStorage.getItem('usuario_nivel');

    // --- 2. PEGAR TODOS OS ELEMENTOS DA PÁGINA ---
    const tituloH1 = document.getElementById('sugestao-problema');
    const statusSpan = document.getElementById('sugestao-status');
    const setorSpan = document.getElementById('sugestao-setor');
    const descricaoTextarea = document.getElementById('sugestao-descricao-completa');
    const solucaoTextarea = document.getElementById('sugestao-solucao');
    const observacoesTextarea = document.getElementById('sugestao-observacoes');
    const linkVoltar = document.getElementById('link-voltar');
    const validacaoLiderDiv = document.getElementById('validacao-lider');
    const acoesAdminDiv = document.getElementById('acoes-admin');
    const btnViavel = document.getElementById('btn-viavel');
    const btnNaoViavel = document.getElementById('btn-nao-viavel');
    const btnRecuperar = document.getElementById('btn-recuperar');
    const btnArquivar = document.getElementById('btn-arquivar');

    // --- 3. FUNÇÕES DE AÇÃO (PARA OS BOTÕES) ---
    async function atualizarStatus(novoStatus) {
        let justificativa = null;
        if (novoStatus === 'nao_viavel_em_analise') {
            justificativa = prompt('Justificativa para considerar "Não Viável":');
            if (!justificativa) return;
        }
        try {
            const response = await fetch(`/api/sugestoes/${sugestaoId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ novo_status: novoStatus, justificativa: justificativa }),
            });
            const data = await response.json();
            alert(data.message);
            if (data.success) window.location.href = linkVoltar.href;
        } catch (error) { alert('Falha na comunicação com o servidor.'); }
    }
    
    async function executarAcaoAdmin(acao) {
        if (acao === 'recuperar') {
            if (!confirm("Deseja salvar as alterações e devolver para o Líder?")) return;
            try {
                const dadosEditados = {
                    problema: descricaoTextarea.value,
                    solucao: solucaoTextarea.value,
                    observacoes: observacoesTextarea.value,
                };
                const editResponse = await fetch(`/api/sugestoes/${sugestaoId}/edit`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosEditados),
                });
                if (!editResponse.ok) throw new Error('Falha ao salvar edições.');
            } catch (error) { alert('Ocorreu um erro ao salvar as edições.'); return; }
        }
        if (acao === 'arquivar') {
            if (!confirm("ATENÇÃO: Deseja arquivar permanentemente esta sugestão?")) return;
        }
        try {
            const response = await fetch(`/api/sugestoes/${sugestaoId}/admin-action`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: acao }),
            });
            const data = await response.json();
            alert(data.message);
            if (data.success) window.location.href = linkVoltar.href;
        } catch (error) { alert('Falha na comunicação com o servidor.'); }
    }

    // --- 4. LÓGICA PRINCIPAL PARA CARREGAR A PÁGINA ---
    if (!sugestaoId) {
        tituloH1.textContent = 'Erro: ID da sugestão não fornecido.';
        return;
    }
    try {
        const response = await fetch(`/api/sugestoes/${sugestaoId}`);
        const sugestao = await response.json();

        if (response.ok) {
            tituloH1.textContent = sugestao.problema_detectado;
            statusSpan.textContent = sugestao.status;
            setorSpan.textContent = sugestao.setor_impactado;
            descricaoTextarea.value = sugestao.problema_detectado;
            solucaoTextarea.value = sugestao.solucao_proposta;
            observacoesTextarea.value = sugestao.observacoes || '';
            
            linkVoltar.href = (nivelAcesso === 'admin') ? '/admin.html' : (nivelAcesso === 'lider' ? '/lider.html' : '/colaborador.html');

            if (nivelAcesso === 'lider' && sugestao.status === 'pendente') {
                validacaoLiderDiv.style.display = 'block';
            } else if (nivelAcesso === 'admin' && sugestao.status === 'nao_viavel_em_analise') {
                acoesAdminDiv.style.display = 'block';
                document.getElementById('justificativa-lider').textContent = sugestao.justificativa_nao_viavel || 'Nenhuma.';
                descricaoTextarea.disabled = false;
                solucaoTextarea.disabled = false;
                observacoesTextarea.disabled = false;
            }
        } else {
            tituloH1.textContent = `Erro: ${sugestao.message}`;
        }
    } catch (error) {
        console.error("Erro pego no bloco principal:", error);
        tituloH1.textContent = 'Erro de Conexão';
    }

    // --- 5. CONECTA AS FUNÇÕES AOS CLIQUES DOS BOTÕES ---
    if (btnViavel) btnViavel.addEventListener('click', () => atualizarStatus('viavel'));
    if (btnNaoViavel) btnNaoViavel.addEventListener('click', () => atualizarStatus('nao_viavel_em_analise'));
    if (btnRecuperar) btnRecuperar.addEventListener('click', () => executarAcaoAdmin('recuperar'));
    if (btnArquivar) btnArquivar.addEventListener('click', () => executarAcaoAdmin('arquivar'));
});