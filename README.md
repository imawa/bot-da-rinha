# bot-da-rinha
 
Jogo para o Discord que eu programei em 2021 para um trabalho de Engenharia de Software.

O jogo pode ser jogado com 2 ou 3 jogadores e mistura questões da disciplina, batalha entre jogadores e piadas internas.

## Uso

Para jogar, é necessário configurar um servidor para o bot:
1. Crie um servidor novo no Discord baseado no modelo em https://discord.new/9tpnWFUVarUq.
2. Ative o modo desenvolvedor do Discord em Configurações -> Avançado.
3. Abra o arquivo config.json com algum editor de texto.
4. Clique com o botão direito no servidor e em Copiar ID. Cole o ID no lugar do x após "idServidor" no config.json.
5. Clique com o botão direito em cada canal, copie os IDs e cole no lugar correspondente do config.json (#como_jogar após "idCanalRegras", #salao_principal -> "idCanalSalao", #loja -> "idCanalLoja", #templo_de_deusvid -> "idCanalTemplo", #jogador_1 -> "idCanalJogador1", #jogador_2 -> "idCanalJogador2" e jogador_3 -> "idCanalJogador3").
6. Abra as configurações de cargo do servidor. Clique com o botão direito em cada cargo, copie o ID e cole no lugar correspondente do config.json (Jogador 1 -> "idCargoJogador1": "", Jogador 2 -> "idCargoJogador2", Jogador 3 -> "idCargoJogador3" e Espectador -> "idCargoEspectador").
7. Crie uma conta de bot no Discord, adicione ao servidor com todas as permissões, copie o token e cole após "token" no config.json.
8. Abra o prompt de comando, navegue até a pasta do bot e inicie com node . ou node index.js. Ao iniciar, o bot vai enviar as regras em #como_jogar.

## Funcionamento do jogo
**Como faço para jogar?**
Digite !entrar para participar do jogo. Quando haver dois jogadores ou mais no jogo, digite !iniciar para iniciá-lo.

**Como funciona o jogo?**
O objetivo do jogo é fazer com que o HP dos adversários chegue a 0.

Quando o jogo iniciar, um salão de jogador vai aparecer para você. Os outros jogadores não podem ver o seu salão.
No salão, é constantemente enviado a situação atual do jogo. Nele, você pode enviar os comandos do jogo: responder as questões, batalhar e comprar itens.

O jogo é dividido em (1) fase de perguntas e (2) batalha.

**(1) Fase de perguntas**
Na fase de perguntas, você responde perguntas para ganhar moedas.
Durante esta fase, você pode usar as moedas através dos comandos na #loja e no #templo_de_deusvid. Os itens obtidos conferem vantagens para a batalha.

_Matemática das moedas (**você pode pular isso**)_
_- A cada turno, você ganha 1 moeda._
_- O acerto de uma questão garante mais 1 moeda._
_- Quando você for o primeiro a responder a questão, caso acerte, receberá mais 1 moeda._

A cada 5 questões, tem início a batalha.

**(2) Batalha**
Na batalha, a cada turno você pode utilizar os comandos:
- !atk: ataca os inimigos, dando o equivalente a seu ATK de dano a todos.
- !def: defende, fazendo que todo o dano equivalente a sua DEF seja anulado. Isto é, se o inimigo atacar com 5 de ATK e você defender com 3 de DEF, você perderá somente 2 HP. Caso você não defenda, o dano bloqueado equivale à metade da sua DEF.

Quando um dos comandos acima é utilizado, seu turno encerra. Quando todos realizarem sua jogada ou o tempo expirar, as habilidades utilizadas são aplicadas e começa um novo turno.

Além disso, você também pode utilizar 1 item sem que seu turno encerre.
O efeito e utilização de cada item está descrito na #loja. __Os itens não podem ser comprados durante a batalha__.

A cada 10 turnos de batalha, tem início outra vez a fase de perguntas.

***Outras informações***:
- !s: exibe seus status
- !espectar: confere o cargo Espectador, permitindo que você veja a partida em progresso

## Questões

As questões vão em ./questoes/. Você pode editar os arquivos atuais para personalizar as questões:
- Nos arquivos disponibilizados, toda questão tem 4 alternativas, mas também é posível adicionar questões com um número diferente de alternativas.
- A resposta é o número da alternativa correta na array, isto é, 0 define a primeira alternativa como a correta.
- A dificuldade define o tempo de resposta da questão. 1 = 60 segundos, 2 = 120 segundos e 3 = 180 segundos.