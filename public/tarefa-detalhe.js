document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. PEGAR INFORMAÇÕES GERAIS ---
    const urlParams = new URLSearchParams(window.location.search);
    const sugestaoId = urlParams.get('id');
    const nivelAcesso = localStorage.getItem('usuario_nivel');

    // --- 2. PEGAR TODOS OS ELEMENTOS DA PÁGINA ---
    const tituloH1 = document.getElementById('sugestao-problema');
    const statusSpan = document.getElementById('sugestao-status');
    const setorSpan = document.getElementById('sugestao-setor');
    const descricaoP = document.getElementById('sugestao-descricao-completa');
    const solucaoP = document.getElementById('sugestao-solucao');
    const observacoesP = document.getElementById('sugestao-observacoes');
    const linkVoltar = document.getElementById('link-voltar');
    const validacaoLiderDiv = document.getElementById('validacao-lider');
    const acoesAdminDiv = document.getElementById('acoes-admin');
    const btnViavel = document.getElementById('btn-viavel');
    const btnNaoViavel = document.getElementById('btn-nao-viavel');
    const btnRecuperar = document.getElementById('btn-recuperar');
    const btnArquivar = document.getElementById('btn-arquivar');

    // --- 3. FUNÇÃO GENÉRICA PARA ATUALIZAR STATUS ---
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
            descricaoP.textContent = sugestao.problema_detectado;
            solucaoP.textContent = sugestao.solucao_proposta;
            observacoesP.textContent = sugestao.observacoes || 'Nenhuma observação.';
            
            if (nivelAcesso === 'admin') {
                linkVoltar.href = '/admin.html';
                if (sugestao.status === 'nao_viavel_em_analise') {
                    acoesAdminDiv.style.display = 'block';
                    document.getElementById('justificativa-lider').textContent = sugestao.justificativa_nao_viavel || 'Nenhuma.';
                }
            } else if (nivelAcesso === 'lider') {
                linkVoltar.href = '/lider.html';
                if (sugestao.status === 'pendente') {
                    validacaoLiderDiv.style.display = 'block';
                }
            } else {
                linkVoltar.href = '/colaborador.html';
            }
        } else {
            tituloH1.textContent = `Erro: ${sugestao.message}`;
        }
    } catch (error) {
        tituloH1.textContent = 'Erro de Conexão';
    }

    // --- 5. ADICIONA FUNCIONALIDADE AOS BOTÕES ---
    if (btnViavel) btnViavel.addEventListener('click', () => atualizarStatus('viavel'));
    if (btnNaoViavel) btnNaoViavel.addEventListener('click', () => atualizarStatus('nao_viavel_em_analise'));
    if (btnRecuperar) btnRecuperar.addEventListener('click', () => {
        if (confirm("Deseja devolver esta sugestão para a análise do Líder?")) {
            atualizarStatus('pendente');
        }
    });
    if (btnArquivar) btnArquivar.addEventListener('click', () => {
        if (confirm("ATENÇÃO: Deseja arquivar permanentemente esta sugestão?")) {
            atualizarStatus('rejeitada');
        }
    });
});