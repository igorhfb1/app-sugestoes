document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const mensagemP = document.getElementById('mensagem');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value;
    const senha = senhaInput.value;
    mensagemP.textContent = 'Enviando dados...';

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (data.success) {
        mensagemP.textContent = data.message;
        
        localStorage.setItem('usuario_id', data.id);
        localStorage.setItem('usuario_nome', data.nome);
        localStorage.setItem('usuario_nivel', data.nivel_acesso);
        
        setTimeout(() => {
          // --- LÓGICA DE REDIRECIONAMENTO COMPLETA ---
          if (data.nivel_acesso === 'colaborador') {
            window.location.href = '/colaborador.html';
          } else if (data.nivel_acesso === 'lider') {
            window.location.href = '/lider.html';
          } else if (data.nivel_acesso === 'admin') {
            // A nova parte para o Admin
            window.location.href = '/admin.html';
          }
        }, 1000);
      } else {
        mensagemP.textContent = data.message;
      }
    } catch (error) {
      console.error('Erro ao tentar fazer login:', error);
      mensagemP.textContent = 'Erro de conexão. Tente novamente.';
    }
  });
});