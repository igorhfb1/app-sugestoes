document.addEventListener('DOMContentLoaded', () => {
    // Preenche o nome do usuário automaticamente
    const nomeUsuario = localStorage.getItem('usuario_nome');
    const nomeInput = document.getElementById('nome-colaborador');
    if (nomeInput && nomeUsuario) {
        nomeInput.value = nomeUsuario;
    }

    const sugestaoForm = document.getElementById('sugestao-form');
    const mensagemP = document.getElementById('mensagem-sugestao');

    sugestaoForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Objeto de dados com os nomes corretos que o backend espera
        const sugestaoData = {
            autor_id: localStorage.getItem('usuario_id'),
            setor: document.getElementById('setor').value,
            problema: document.getElementById('acontecimentos').value,
            solucao: document.getElementById('solucao').value,
            observacoes: document.getElementById('observacoes').value,
        };

        mensagemP.textContent = 'Enviando...';

        try {
            const response = await fetch('/api/sugestoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sugestaoData),
            });
            const data = await response.json();
            if (data.success) {
                mensagemP.textContent = data.message;
                // Após 2 segundos, volta para o painel principal
                setTimeout(() => {
                    window.location.href = '/colaborador.html';
                }, 2000);
            } else {
                mensagemP.textContent = `Falha ao enviar: ${data.message}`;
            }
        } catch (error) {
            console.error('Erro ao enviar sugestão:', error);
            mensagemP.textContent = 'Erro de conexão.';
        }
    });
});