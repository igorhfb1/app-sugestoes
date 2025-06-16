document.addEventListener('DOMContentLoaded', () => {
    const revisaoDiv = document.getElementById('lista-sugestoes-revisao');

    async function carregarSugestoesRevisao() {
        if (!revisaoDiv) return;
        try {
            const response = await fetch('/api/sugestoes/revisao-admin');
            const sugestoes = await response.json();
            if (sugestoes.length === 0) {
                revisaoDiv.innerHTML = '<p>Nenhuma sugestão para análise no momento.</p>';
            } else {
                revisaoDiv.innerHTML = sugestoes.map(sugestao => `
                    <a href="/sugestao-detalhe.html?id=${sugestao.id}" class="sugestao-link">
                        <div class="sugestao-item status-${sugestao.status.replace(/\s+/g, '-')}">
                            <strong>${sugestao.problema_detectado}</strong>
                            <p>Setor: ${sugestao.setor_impactado} | Status: <strong>${sugestao.status}</strong></p>
                        </div>
                    </a>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar sugestões para revisão:', error);
            revisaoDiv.innerHTML = '<p>Erro ao carregar sugestões.</p>';
        }
    }
    carregarSugestoesRevisao();
});