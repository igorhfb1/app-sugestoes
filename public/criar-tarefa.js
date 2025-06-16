document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos da Página ---
    const sugestaoSelect = document.getElementById('sugestao-associada');
    const responsavelSelect = document.getElementById('tarefa-responsavel');
    const prazoInput = document.getElementById('tarefa-prazo');
    const formNovaTarefa = document.getElementById('form-nova-tarefa');
    const mensagemTarefaP = document.getElementById('mensagem-tarefa');

    // --- Lógica para Carregar Dados Iniciais (continua a mesma) ---
    async function carregarDadosFormulario() {
        prazoInput.min = new Date().toISOString().split("T")[0];
        try {
            const [sugestoesRes, colaboradoresRes] = await Promise.all([
                fetch('/api/sugestoes-viaveis'),
                fetch('/api/colaboradores')
            ]);
            const sugestoes = await sugestoesRes.json();
            const colaboradores = await colaboradoresRes.json();

            sugestaoSelect.innerHTML = '<option value="">Selecione uma sugestão...</option>';
            sugestoes.forEach(sugestao => {
                const option = document.createElement('option');
                option.value = sugestao.id;
                option.textContent = `ID ${sugestao.id}: ${sugestao.problema_detectado}`;
                sugestaoSelect.appendChild(option);
            });

            responsavelSelect.innerHTML = '<option value="">Selecione um colaborador...</option>';
            colaboradores.forEach(colaborador => {
                const option = document.createElement('option');
                option.value = colaborador.id;
                option.textContent = colaborador.nome;
                responsavelSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar dados para o formulário:', error);
            alert('Não foi possível carregar os dados necessários para o formulário.');
        }
    }
    carregarDadosFormulario();

    // --- NOVA PARTE: LÓGICA PARA ENVIAR O FORMULÁRIO ---
    formNovaTarefa.addEventListener('submit', async (event) => {
        event.preventDefault();

        const tarefaData = {
            sugestao_id: sugestaoSelect.value,
            titulo: document.getElementById('tarefa-titulo').value,
            descricao: document.getElementById('tarefa-descricao').value,
            responsavel_id: responsavelSelect.value,
            prazo: prazoInput.value,
        };

        if (!tarefaData.sugestao_id || !tarefaData.responsavel_id) {
            alert('Por favor, selecione a sugestão e o responsável.');
            return;
        }

        mensagemTarefaP.textContent = 'Criando tarefa...';

        try {
            const response = await fetch('/api/tarefas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tarefaData),
            });
            const data = await response.json();
            
            mensagemTarefaP.textContent = data.message;
            if (data.success) {
                formNovaTarefa.reset(); // Limpa o formulário para poder criar outra tarefa
            }
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            mensagemTarefaP.textContent = 'Erro de conexão ao criar tarefa.';
        }
    });
});