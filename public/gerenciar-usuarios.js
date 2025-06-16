document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lista-usuarios-container');

    async function atualizarNivelAcesso(usuarioId, novoNivel) {
        try {
            const response = await fetch(`/api/usuarios/${usuarioId}/nivel-acesso`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ novo_nivel: novoNivel }),
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Erro ao atualizar nível:', error);
            alert('Falha na comunicação com o servidor.');
        }
    }
    
    async function carregarUsuarios() {
        if (!container) return;
        try {
            const response = await fetch('/api/usuarios');
            const usuarios = await response.json();
            const loggedInUserId = localStorage.getItem('usuario_id');

            if (usuarios.length === 0) {
                container.innerHTML = '<p>Nenhum usuário encontrado.</p>';
            } else {
                let tableHTML = `
                    <table class="user-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Nível de Acesso</th>
                            </tr>
                        </thead>
                        <tbody>`;

                usuarios.forEach(usuario => {
                    let accessLevelCellHTML = '';
                    if (usuario.id == loggedInUserId) {
                        accessLevelCellHTML = `<td><strong>${usuario.nivel_acesso} (Você)</strong></td>`;
                    } else {
                        accessLevelCellHTML = `
                            <td>
                                <select class="role-select" data-userid="${usuario.id}">
                                    <option value="colaborador" ${usuario.nivel_acesso === 'colaborador' ? 'selected' : ''}>Colaborador</option>
                                    <option value="lider" ${usuario.nivel_acesso === 'lider' ? 'selected' : ''}>Líder</option>
                                    <option value="admin" ${usuario.nivel_acesso === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </td>`;
                    }
                    tableHTML += `
                        <tr>
                            <td>${usuario.nome}</td>
                            <td>${usuario.email}</td>
                            ${accessLevelCellHTML} 
                        </tr>`;
                });

                tableHTML += `</tbody></table>`;
                container.innerHTML = tableHTML;

                const allSelects = document.querySelectorAll('.role-select');
                allSelects.forEach(select => {
                    select.addEventListener('change', (event) => {
                        const novoNivel = event.target.value;
                        const usuarioId = select.dataset.userid;
                        if (confirm(`Tem certeza que deseja alterar o nível deste usuário para "${novoNivel}"?`)) {
                            atualizarNivelAcesso(usuarioId, novoNivel);
                        } else {
                            location.reload(); 
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            container.innerHTML = '<p>Erro ao carregar usuários.</p>';
        }
    }

    carregarUsuarios();
});