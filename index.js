const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let escolhas = {};

io.on('connection', (socket) => {
  console.log('Novo usuário conectado');

  socket.on('escolha', (escolha) => {
    //Comando criado para verificar se as escolhas estavam sendo enviadas para o servidor
    console.log(`Jogador ${socket.id} escolheu: ${escolha}`);
    
    if (['pedra', 'papel', 'tesoura'].includes(escolha)) {
      escolhas[socket.id] = escolha;

      if (Object.keys(escolhas).length === 2) {
        const jogador1 = Object.keys(escolhas)[0];
        const jogador2 = Object.keys(escolhas)[1];

        const escolhaJogador1 = escolhas[jogador1];
        const escolhaJogador2 = escolhas[jogador2];

        //Comando let utilizado para que o jogo continue após a primeira partida
        let resultadoJogador1, resultadoJogador2, corJogador1, corJogador2;

        if (escolhaJogador1 === escolhaJogador2) {
          resultadoJogador1 = 'Empate';
          resultadoJogador2 = 'Empate';
          corJogador1 = 'gray' // Cor do empate
          corJogador2 = 'gray' // Cor do empate
        } else if (
          (escolhaJogador1 === 'pedra' && escolhaJogador2 === 'tesoura') ||
          (escolhaJogador1 === 'papel' && escolhaJogador2 === 'pedra') ||
          (escolhaJogador1 === 'tesoura' && escolhaJogador2 === 'papel')
        ) {
          resultadoJogador1 = 'Vitória';
          resultadoJogador2 = 'Derrota';
          corJogador1 = 'green'; // Cor da vitória
          corJogador2 = 'red';   // Cor da derrota
        } else {
          resultadoJogador1 = 'Derrota';
          resultadoJogador2 = 'Vitória';
          corJogador1 = 'red';   // Cor da derrota
          corJogador2 = 'green'; // Cor da vitória
        }

        // Enviar resultado e cor para cada jogador individualmente
        io.to(jogador1).emit('resultado', { resultado: resultadoJogador1, cor: corJogador1 });
        io.to(jogador2).emit('resultado', { resultado: resultadoJogador2, cor: corJogador2 });

        // Limpar escolhas para a próxima rodada
        escolhas = {};
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Usuário ${socket.id} desconectado`);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});