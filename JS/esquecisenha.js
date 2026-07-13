 // Aba atual selecionada
 let abaAtual = 'email';

 /**
  * trocarAba(aba)
  * Alterna entre as abas de e-mail e telefone.
  */
 function trocarAba(aba) {
   abaAtual = aba;

   // Atualiza visual das abas
   document.querySelectorAll('.tab').forEach((t, i) => {
     t.classList.toggle('active', (i === 0 && aba === 'email') || (i === 1 && aba === 'telefone'));
   });

   // Mostra o painel correto
   document.getElementById('panel-email').classList.toggle('active', aba === 'email');
   document.getElementById('panel-telefone').classList.toggle('active', aba === 'telefone');

   // Esconde mensagem de sucesso ao trocar de aba
   document.getElementById('success-box').classList.remove('show');
 }

 /**
  * mascaraTel(input)
  * Formata o telefone automaticamente: (00) 00000-0000
  */
 function mascaraTel(input) {
   let v = input.value.replace(/\D/g, '');
   v = v.replace(/^(\d{2})(\d)/, '($1) $2');
   v = v.replace(/(\d{5})(\d)/, '$1-$2');
   input.value = v;
 }

 /**
  * enviar(tipo)
  * Valida o campo e exibe mensagem de sucesso.
  * Em um projeto real, aqui seria feita uma chamada à API.
  */
 function enviar(tipo) {
   const box = document.getElementById('success-box');

   if (tipo === 'email') {
     const email = document.getElementById('email').value.trim();
     if (!email || !email.includes('@')) {
       alert('Por favor, digite um e-mail válido.');
       return;
     }
     box.textContent = '✅ E-mail enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.';
   } else {
     const tel = document.getElementById('telefone').value.replace(/\D/g, '');
     if (tel.length < 10) {
       alert('Por favor, digite um número de telefone válido.');
       return;
     }
     box.textContent = '✅ Código enviado por SMS! Verifique seu celular e siga as instruções para redefinir sua senha.';
   }

   box.classList.add('show');
 }