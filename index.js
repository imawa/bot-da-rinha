const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Discord.Client();

let jogadores;

let bencoes;

let servidor;
let canaisJogadores, salao, loja, templo;
let cargosJogadores, cargoEspectador;

client.once('ready', () => {
    console.log(`Logado como ${client.user.tag}`);

    // Pegar servidor, canais e cargos utilizados durante o jogo
    servidor = client.guilds.cache.get(config.idServidor);
    canaisJogadores = [client.channels.cache.get(config.idCanalJogador1), client.channels.cache.get(config.idCanalJogador2), client.channels.cache.get(config.idCanalJogador3)];
    regras = client.channels.cache.get(config.idCanalRegras);
    salao = client.channels.cache.get(config.idCanalSalao);
    loja = client.channels.cache.get(config.idCanalLoja);
    templo = client.channels.cache.get(config.idCanalTemplo);
    cargosJogadores = [servidor.roles.cache.get(config.idCargoJogador1), servidor.roles.cache.get(config.idCargoJogador2), servidor.roles.cache.get(config.idCargoJogador3)];
    cargoEspectador = servidor.roles.cache.get(config.idCargoEspectador);

    if (config.primeiraInicializacao) {
        // Mensagem da loja, templo e regras
        const mensagemLoja = new Discord.MessageEmbed()
            .setTitle('LOJA')
            .setDescription(`Envie o comando do item ('${config.prefixo}{item}') para comprá-lo através de suas moedas.\n\nVocê pode enviar '${config.prefixo}{item} {quantidade}' para comprar vários de uma vez.`)
            .setColor('#f7a000')
            .addField('\u200B', 'STATS', false)
            .addField(`+1 ataque - 2 moedas cada - ${config.prefixo}catk`, `Adiciona mais 1 ponto a seu ataque.`, true)
            .addField(`+1 def - 2 moedas cada - ${config.prefixo}cdef`, `Adiciona mais 1 ponto a sua defesa ativa e 0.5 à passiva.`, true)
            .addField(`+2 HP - 1 moeda cada - ${config.prefixo}chp`, `Adiciona mais 2 pontos de vida.`, true)
            .addField('\u200B', 'POÇÕES', false)
            .addField(`Poção pequena - 1 moeda cada - ${config.prefixo}cpp`, `Regenera 3 HP. Utilize com ${config.prefixo}pp`, true)
            .addField(`Poção média - 2 moedas cada - ${config.prefixo}cpm`, `Regenera 8 HP. Utilize com ${config.prefixo}pm`, true)
            .addField(`Poção grande - 3 moedas cada - ${config.prefixo}cpg`, `Regenera 18 HP. Utilize com ${config.prefixo}pg.`, true);
        loja.send(mensagemLoja);

        const mensagemTemplo = new Discord.MessageEmbed()
            .setTitle('TEMPLO DE DEUSVID')
            .setDescription(`*Você se depara com um monumento que carrega uma atmosfera misteriosa.*\n\nNa parede, é possível brevemente identificar as letras:\n**Ofereça uma prece a seu Deusvid**`)
            .setColor('#a705d3')
            .addField(`Prece - 1 moeda - ${config.prefixo}prece`, '???', true)
            .setImage('https://courrier.jp/media/2020/01/02132840/INDIA-ROYAL-MYSTERY-2-6-1600x1067.jpg');
        templo.send(mensagemTemplo);

        regras.send(`**Como faço para jogar?**\nDigite ${config.prefixo}entrar para participar do jogo. Quando haver dois jogadores ou mais no jogo, digite ${config.prefixo}iniciar para iniciá-lo.\n\n**Como funciona o jogo?**\nO objetivo do jogo é fazer com que o HP dos adversários chegue a 0.\n\nQuando o jogo iniciar, um salão de jogador vai aparecer para você. Os outros jogadores não podem ver o seu salão.\nNo salão, é constantemente enviado a situação atual do jogo. Nele, você pode enviar os comandos do jogo: responder as questões, batalhar e comprar itens.\n\nO jogo é dividido em (1) fase de perguntas e (2) batalha.\n\n**(1) Fase de perguntas**\nNa fase de perguntas, você responde perguntas para ganhar moedas.\nDurante esta fase, você pode usar as moedas através dos comandos na #loja e no #templo_de_deusvid. Os itens obtidos conferem vantagens para a batalha.\n\n_Matemática das moedas (**você pode pular isso**)_\n_- A cada turno, você ganha 1 moeda._\n_- O acerto de uma questão garante mais 1 moeda._\n_- Quando você for o primeiro a responder a questão, caso acerte, receberá mais 1 moeda._\n\nA cada 5 questões, tem início a batalha.`);
        regras.send(`**(2) Batalha**\nNa batalha, a cada turno você pode utilizar os comandos:\n- ${config.prefixo}atk: ataca os inimigos, dando o equivalente a seu ATK de dano a todos.\n- ${config.prefixo}def: defende, fazendo que todo o dano equivalente a sua DEF seja anulado. Isto é, se o inimigo atacar com 5 de ATK e você defender com 3 de DEF, você perderá somente 2 HP. Caso você não defenda, o dano bloqueado equivale à metade da sua DEF.\n\nQuando um dos comandos acima é utilizado, seu turno encerra. Quando todos realizarem sua jogada ou o tempo expirar, as habilidades utilizadas são aplicadas e começa um novo turno.\n\nAlém disso, você também pode utilizar 1 item sem que seu turno encerre.\nO efeito e utilização de cada item está descrito na #loja. __Os itens não podem ser comprados durante a batalha__.\n\nA cada 10 turnos de batalha, tem início outra vez a fase de perguntas.`);
        regras.send(`***Outras informações***:\n- ${config.prefixo}s: exibe seus status\n- ${config.prefixo}espectar: confere o cargo Espectador, permitindo que você veja a partida em progresso`);

        // Remover primeira inicialização
        config.primeiraInicializacao = false;

        fs.writeFile('./config.json', JSON.stringify(config), function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }

    // Resetar o jogo
    reiniciar();
});

client.on('message', msg => {
    if (msg.author.id !== client.user.id) {
        // Comandos que podem ser utilizados a qualquer momento
        comandosGlobais(msg);

        // Comandos específicos para cada fase
        switch (fase) {
            case 0:
                // Jogo ainda não iniciou
                comandosFaseInicial(msg);
                break;

            case 1:
                // Fase de questões
                comandosFaseQuestoes(msg);
                break;

            case 2:
                // Fase de batalha
                comandosFaseBatalha(msg);
                break;

            case 998:
                // Fase que permite somente os comandos da loja, do templo e de stats (entre a fase de questoes e a batalha)
                jogador = jogadores.find(x => x.usuario.id === msg.member.id);

                if (jogador !== undefined) {
                    comandosLoja(msg, jogador);
                    comandosTemplo(msg, jogador);
                    comandoStats(msg, jogador);
                }
                break;
        }
    }
});

function reiniciar() {
    jogadores = new Array;

    bencoes = {
        'cinzas': 0,
        'lamina': 0,
        'escudo': 0,
        'sangue': 0,
        'morte': 0,
        'aco': 0
    }
    turnosRestantesAco = 5;

    fase = 0;
    turno = 0;

    clearTimeout(timer);

    console.log('Jogo reiniciado');
}

function enviarMensagem(msg, canal) {
    canal.send(msg).then(sent => setTimeout(function () { sent.delete() }, config.tempoApagarMensagem));
}

function comandosGlobais(msg) {
    if (msg.content === `${config.prefixo}reiniciar`) {
        reiniciar();
        msg.react('✅');
    } else if (msg.content === `${config.prefixo}espectar`) {
        // Conferir se a pessoa que enviou a mensagem não é um jogador
        if (jogadores.filter(e => e.usuario.id === msg.member.id).length > 0) {
            msg.react('❌');
            return;
        }

        // Dar cargo de espectador
        msg.member.roles.add(cargoEspectador);
        msg.react('✅');
    }
}

function comandosFaseInicial(msg) {
    if (msg.content === `${config.prefixo}entrar`) {
        if (jogadores.length < 3) {
            // Conferir se o usuário já não entrou
            if (jogadores.filter(e => e.usuario.id === msg.member.id).length > 0) {
                msg.react('❌');
                return;
            }

            // Adicionar jogador
            let jogador = {
                'usuario': msg.member,
                'canal': canaisJogadores[jogadores.length],
                'cargo': cargosJogadores[jogadores.length],
                'decisaoTurno': 0,
                'itemTurno': 0,
                'moedas': 0,
                'atk': 1,
                'atkMax': 100,
                'def': 1,
                'defMax': 100,
                'hp': 40,
                'hpTotal': 40,
                'hpMax': 100,
                'pocaoPequena': 0,
                'pocaoMedia': 0,
                'pocaoGrande': 0
            }
            jogadores.push(jogador);

            msg.react('✅');
        } else {
            msg.react('❌');
        }
    } else if (msg.content === `${config.prefixo}iniciar`) {
        if (jogadores.length >= 2) {
            msg.react('✅');

            enviarMensagem(`Iniciando o jogo com ${jogadores.length} jogadores...\n**As questões começarão a ser enviadas em 5 segundos.**`, salao);

            // Configurar jogadores
            for (i in jogadores) {
                // Remover cargos
                cargosJogadores.forEach(cargo => jogadores[i].usuario.roles.remove(cargo));
                jogadores[i].usuario.roles.remove(cargoEspectador);

                // Adicionar cargo individual
                jogadores[i].usuario.roles.add(cargosJogadores[i]);

                enviarMensagem(`<@${jogadores[i].usuario.id}> este é o seu salão de jogador.`, jogadores[i].canal);
            }

            timer = setTimeout(function () { iniciarFaseQuestoes() }, 5 * 1000);
        } else {
            msg.react('❌');
        }
    }
}

////////////////////////
// CONTROLE DE TURNOS //
////////////////////////

let fase = 0;

let turno = 0, tempoTurno;
const turnoMaxQuestoes = 5, turnoMaxBatalha = 10;

let timer;

function avancarTurno() {
    switch (fase) {
        case 1:
            // Fase de questões
            revelarRespostaQuestaoAtual();

            if (turno < turnoMaxQuestoes) {
                // Próxima questão
                timer = setTimeout(function () { novaQuestao(); }, 2 * 1000);
                console.log(`${turno}/${turnoMaxQuestoes} Próxima questão`);
            } else {
                // Trocar para a fase de batalha
                clearTimeout(timer);

                jogadores.forEach(jogador => {
                    // Resetar escolhas
                    jogador.decisaoTurno = 0;
                    jogador.itemTurno = 0;

                    // Notificar jogadores
                    enviarMensagem('**A batalha iniciará em 30 segundos!**\nDurante a batalha, você não poderá comprar itens. Portanto, compre agora o que precisar!', jogador.canal);
                })

                fase = 998; // Fase que só permite os comandos da loja
                timer = setTimeout(function () { iniciarFaseBatalha(); }, 30 * 1000);

                console.log('Troca para a fase de batalha');
            }

            break;

        case 2:
            // Fase de batalha
            if (turno < turnoMaxBatalha) {
                novoTurnoBatalha();
            } else {
                // Trocar para a fase de questões
                clearTimeout(timer);

                mostrarMensagemBatalha('');
                conferirFimDeJogo();

                jogadores.forEach(jogador => {
                    // Resetar escolhas
                    jogador.decisaoTurno = 0;
                    jogador.itemTurno = 0;

                    // Notificar jogadores
                    enviarMensagem('A fase de perguntas terá início em 15 segundos.', jogador.canal);
                });

                fase = 999; // Fase inexistente para não permitir mais comandos da batalha
                timer = setTimeout(function () { iniciarFaseQuestoes(); }, 15 * 1000);

                console.log('Troca para a fase de questões');
            }
            break;
    }
}

function comandoStats(msg, jogador) {
    if (msg.content === `${prefixo}s`) {
        let embed = new MessageEmbed()
            .setColor('#f7a000')
            .setDescription(`Informações do jogador`)
            .addField('\u200B', `<@${jogador.usuario.id}>`, false)
            .addField('HP', `${(Math.round(jogador.hp * 100) / 100)}/${(Math.round(jogador.hpTotal * 100) / 100)}`, true)
            .addField(`ATAQUE (${prefixo}atk)`, `${jogador.atk}`, true)
            .addField(`DEFESA (${prefixo}def)`, `${jogador.def}`, true)
            .addField('\u200B', 'Seu inventário', true);

        // Poções
        if (jogador.pocaoPequena > 0) embed.addField(`Poção pequena (+3 HP, ${prefixo}pp)`, `x${jogador.pocaoPequena}`, true);
        if (jogador.pocaoMedia > 0) embed.addField(`Poção média (+8 HP, ${prefixo}pm)`, `x${jogador.pocaoMedia}`, true);
        if (jogador.pocaoGrande > 0) embed.addField(`Poção grande (+18 HP, ${prefixo}pg)`, `x${jogador.pocaoGrande}`, true);

        // Benções
        if (bencoes.cinzas === jogador.usuario.id) embed.addField('Bênção das cinzas', `Ao morrer, o jogador revive uma vez a partir de suas cinzas.`, true);
        if (bencoes.lamina === jogador.usuario.id) embed.addField('Bênção da lâmina', `Todo ataque causa 40% a mais de dano.`, true);
        if (bencoes.escudo === jogador.usuario.id) embed.addField('Bênção do escudo', `Os ataques recebidos terão 50% a mais da defesa atual absorvida.`, true);
        if (bencoes.sangue === jogador.usuario.id) embed.addField('Bênção do sangue', `A cada turno, o HP é regenerado o equivalente a 10% de todas as poções no inventário.`, true);
        if (bencoes.morte === jogador.usuario.id) embed.addField('Bênção da morte', `20% do dano passa a ser aplicado no HP máximo dos oponentes.`, true);
        if (bencoes.aco === jogador.usuario.id) embed.addField(`Bênção do aço (${prefixo}ba)`, `O jogador fica imune a qualquer tipo de dano durante 5 rodadas após ativada.`, true);

        enviarMensagem(embed, jogador.canal);
    }
}

//////////////////////
// FASE DE QUESTÕES //
//////////////////////

let idJogadorPrimeiraResposta = 0;

const questoes = fs.readdirSync('./questoes')
    .filter(nome => path.extname(nome) === '.json')
    .map(nome => require(path.join(__dirname, './questoes', nome)));

let questaoAtual;

function comandosFaseQuestoes(msg) {
    jogador = jogadores.find(x => x.usuario.id === msg.member.id);

    if (jogador !== undefined) {

        if (!isNaN(msg.content) && !isNaN(parseFloat(msg.content))) {
            // Resposta da questão
            let resposta = parseInt(msg.content);

            if (resposta > 0 && resposta <= questaoAtual.alternativas.length) {
                jogador = jogadores.find(x => x.usuario.id === msg.member.id);

                if (jogador.decisaoTurno === 0) {
                    jogador.decisaoTurno = resposta;

                    if (idJogadorPrimeiraResposta === 0) {
                        idJogadorPrimeiraResposta = jogador.usuario.id;
                    }

                    msg.react('✅');

                    // Conferir se todo mundo já respondeu
                    if (jogadores.filter(jogador => jogador.decisaoTurno !== 0).length === jogadores.length) {
                        clearTimeout(timer);
                        avancarTurno();
                    }

                } else {
                    // Já respondeu
                    msg.react('❌');
                }
            } else {
                // Resposta inexistente
                msg.react('❌');
            }
        } else {
            comandosLoja(msg, jogador);
            comandosTemplo(msg, jogador);
            comandoStats(msg, jogador);
        }

    }

}

function iniciarFaseQuestoes() {
    fase = 1;
    turno = 0;
    novaQuestao();
}

function novaQuestao() {
    turno++;

    // Resetar as escolhas do jogador
    jogadores.forEach(jogador => {
        jogador.decisaoTurno = 0;
        jogador.itemTurno = 0;
    })

    idJogadorPrimeiraResposta = 0;

    // Escolher questão
    questaoAtual = questoes[Math.floor(Math.random() * (questoes.length))];

    // Mensagem da questão
    switch (questaoAtual.dificuldade) {
        case '1':
            tempoTurno = 60;
            break;

        case '2':
            tempoTurno = 120;
            break;

        case '3':
            tempoTurno = 180;
            break;
    }

    let embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`QUESTÃO ${turno}/${turnoMaxQuestoes}`)
        .setDescription(questaoAtual.questao)
        .addField('ALTERNATIVAS', 'Digite o número da sua resposta', false);

    // Alternativas
    for (i in questaoAtual.alternativas) {
        embed.addField(`${parseInt(i) + 1}`, questaoAtual.alternativas[i], true);
    }

    // Imagem
    if (questaoAtual.imagem !== '') {
        embed.setImage(questaoAtual.imagem);
    }

    embed.setFooter(`${tempoTurno} segundos para responder`, config.imagemFooterMensagem);

    // Enviar a questão no canal de cada jogador
    jogadores.forEach(jogador => enviarMensagem(embed, jogador.canal));

    timer = setTimeout(function () { avancarTurno() }, tempoTurno * 1000);
}

function revelarRespostaQuestaoAtual() {
    jogadores.forEach(jogador => {
        let moedasNovas = 0;

        let embed = new Discord.MessageEmbed().setTitle(`RESPOSTA: (${parseInt(questaoAtual.resposta) + 1})`);
        let mensagemBonus = '';

        if (jogador.decisaoTurno === 0) {
            // Não respondeu -> não ganha moedas
            embed.setColor('#e71a23')
                .setDescription('Você não respondeu.');
        } else {
            moedasNovas++;

            if (jogador.decisaoTurno === parseInt(questaoAtual.resposta) + 1) {
                // Acertou
                moedasNovas++;

                embed.setColor('#76ab1e')
                    .setDescription('Você acertou!');

                // Bônus de primeira resposta
                if (idJogadorPrimeiraResposta === jogador.usuario.id) {
                    mensagemBonus = ' [BÔNUS PRIMEIRO]';
                    moedasNovas++;
                }

            } else {
                // Errou
                embed
                    .setColor('#e71a23')
                    .setDescription('Você errou.');
            }

        }

        embed.setFooter(`Moedas: ${jogador.moedas} (+${moedasNovas})${mensagemBonus}`, config.imagemFooterMensagem);
        jogador.moedas += moedasNovas;
        enviarMensagem(embed, jogador.canal);
    });
}

function comandosLoja(msg, jogador) {
    let mensagem = msg.content.split(' ');

    let embed = new Discord.MessageEmbed()
        .setColor('#e71a23');

    let mensagemTransacao = '';

    let comandoValido = false;

    // Quantidade comprada
    let quantidade = 1;
    if (mensagem.length > 1 && typeof parseInt(mensagem[1]) === 'number' && parseInt(mensagem[1]) > 0) {
        quantidade = parseInt(mensagem[1]);
    }

    switch (mensagem[0]) {
        case `${config.prefixo}cpp`:
            // Poção pequena
            comandoValido = true;

            if (compraValida(quantidade, 1, jogador, embed)) {
                jogador.pocaoPequena += quantidade;

                embed.setDescription(`Você comprou x${quantidade} poção pequena.`)
                    .setColor('#76ab1e');
                mensagemTransacao = ` (-${1 * quantidade})`;
            }
            break;

        case `${config.prefixo}cpm`:
            // Poção média
            comandoValido = true;

            if (compraValida(quantidade, 2, jogador, embed)) {
                jogador.pocaoMedia += quantidade;

                embed.setDescription(`Você comprou x${quantidade} poção média.`)
                    .setColor('#76ab1e');
                mensagemTransacao = ` (-${2 * quantidade})`;
            }
            break;

        case `${config.prefixo}cpg`:
            // Poção grande
            comandoValido = true;

            if (compraValida(quantidade, 3, jogador, embed)) {
                jogador.pocaoGrande += quantidade;

                embed.setDescription(`Você comprou x${quantidade} poção grande.`)
                    .setColor('#76ab1e');
                mensagemTransacao = ` (-${3 * quantidade})`;
            }
            break;

        case `${config.prefixo}catk`:
            // Ataque
            comandoValido = true;

            // Máximo comprável
            if (jogador.atk + quantidade > jogador.atkMax) {
                quantidade = jogador.atkMax - jogador.atk;
            }

            if (compraValida(quantidade, 2, jogador, embed)) {
                jogador.atk += quantidade;

                embed.setDescription(`Você comprou mais ${quantidade} ponto(s) de ataque.`)
                    .setColor('#76ab1e');
                mensagemTransacao = ` (-${2 * quantidade})`;
            }
            break;

        case `${config.prefixo}cdef`:
            // Defesa
            comandoValido = true;

            // Máximo comprável
            if (jogador.def + quantidade > jogador.defMax) {
                quantidade = jogador.defMax - jogador.def;
            }

            if (compraValida(quantidade, 2, jogador, embed)) {
                jogador.def += quantidade;

                embed.setDescription(`Você comprou mais ${quantidade} ponto(s) de defesa.`)
                    .setColor('#76ab1e');
                mensagemTransacao = ` (-${2 * quantidade})`;
            }
            break;

        case `${config.prefixo}chp`:
            // HP
            comandoValido = true;

            // Máximo comprável
            if (jogador.hp + quantidade * 2 > jogador.hpMax) {
                quantidade = Math.floor((jogador.hpMax - jogador.hp) / 2);
            }

            if (compraValida(quantidade, 2, jogador, embed)) {
                jogador.hpTotal += quantidade;

                embed.setDescription(`Você comprou mais ${2 * quantidade} HP.`)
                    .setColor('#76ab1e');
                mensagemTransacao = ` (-${2 * quantidade})`;
            }
            break;
    }

    if (comandoValido) {
        embed.setFooter(`Moedas: ${jogador.moedas}${mensagemTransacao}`, config.imagemFooterMensagem);
        enviarMensagem(embed, jogador.canal);
    }

}

function comandosTemplo(msg, jogador) {
    if (msg.content === `${config.prefixo}prece`) {
        if (jogador.moedas >= 1) {
            jogador.moedas--;
            novaPrece(jogador);
        }
    }
}

function compraValida(quantidade, preco, jogador, embed) {
    if (jogador.moedas >= preco * quantidade) {
        jogador.moedas -= preco * quantidade;
        return true;
    } else {
        embed.setDescription(`Você não possui moedas suficientes.`);
        return false;
    }
}

function novaPrece(jogador) {
    let embed = new Discord.MessageEmbed()
        .setColor('#a705d3')
        .setFooter(`Moedas: ${jogador.moedas} (-1)`, config.imagemFooterMensagem);

    // Sortear item
    let numeroSorteado = Math.floor(Math.random() * 101) + 1;

    if (numeroSorteado <= 15) {
        // Dar benção
        let numeroSorteadoBencao = Math.floor(Math.random() * 6);

        if (bencoes[Object.keys(bencoes)[numeroSorteadoBencao]] === 0) {
            // Benção ainda não foi pega
            let nome = '', descricao = '';

            switch (numeroSorteadoBencao) {
                case 0:
                    nome = 'Bênção das cinzas';
                    descricao = 'Ao morrer, o jogador revive uma vez a partir de suas cinzas.';
                    bencoes.cinzas = jogador.usuario.id;
                    break;

                case 1:
                    nome = 'Bênção da lâmina';
                    descricao = 'Todo ataque causa 40% a mais de dano.';
                    bencoes.lamina = jogador.usuario.id;
                    break;

                case 2:
                    nome = 'Bênção do escudo';
                    descricao = 'Os ataques recebidos terão 50% a mais da defesa atual absorvida.';
                    bencoes.escudo = jogador.usuario.id;
                    break;

                case 3:
                    nome = 'Bênção do sangue';
                    descricao = 'A cada turno, o HP é regenerado o equivalente a 10% de todas as poções no inventário.';
                    bencoes.sangue = jogador.usuario.id;
                    break;

                case 4:
                    nome = 'Bênção da morte';
                    descricao = '20% do dano passa a ser aplicado no HP máximo dos oponentes.';
                    bencoes.morte = jogador.usuario.id;
                    break;

                case 5:
                    nome = `Bênção do aço (${config.prefixo}ba)`;
                    descricao = 'O jogador fica imune a qualquer tipo de dano durante 5 rodadas após ativada.';
                    bencoes.aco = jogador.usuario.id;
                    break;
            }

            embed.setDescription('Você oferece uma moeda ao templo de Deivid.\nVocê recebeu uma bênção!')
                .addField(nome, descricao, false);
        } else {
            // Benção pega -> dar poção grande
            jogador.pocaoGrande++;
            embed.setDescription(`Você oferece uma moeda ao templo de Deivid.\nVocê recebeu uma poção grande! (x${jogador.pocaoGrande} no inventário)`);
        }

    } else if (numeroSorteado <= 50) {
        // Dar poção: 20% poção grande, 40% media, 40% pequena
        let numeroSorteadoPocao = Math.floor(Math.random() * 101) + 1;

        if (numeroSorteadoPocao <= 20) {
            // Grande
            jogador.pocaoGrande++;
            embed.setDescription(`Você oferece uma moeda ao templo de Deivid.\nVocê recebeu uma poção grande. (x${jogador.pocaoGrande} no inventário)`);
        } else if (numeroSorteadoPocao <= 60) {
            // Media
            jogador.pocaoMedia++;
            embed.setDescription(`Você oferece uma moeda ao templo de Deivid.\nVocê recebeu uma poção média. (x${jogador.pocaoMedia} no inventário)`);
        } else {
            // Pequena
            jogador.pocaoPequena++;
            embed.setDescription(`Você oferece uma moeda ao templo de Deivid.\nVocê recebeu uma poção pequena. (x${jogador.pocaoPequena} no inventário)`);
        }

    } else {
        // Nada
        embed.setDescription(`Você oferece uma moeda ao templo de Deivid.\nNada aconteceu.`);
    }

    enviarMensagem(embed, jogador.canal);
}

/////////////////////
// FASE DA BATALHA //
/////////////////////

let turnosRestantesAco = 5;

function comandosFaseBatalha(msg) {
    jogador = jogadores.find(x => x.usuario.id === msg.member.id);

    if (jogador !== undefined) {
        if (jogador.decisaoTurno === 0) {
            switch (msg.content) {
                case `${config.prefixo}atk`:
                    // Atacar
                    jogador.decisaoTurno = 1;
                    msg.react('✅');
                    break;

                case `${config.prefixo}def`:
                    // Defender
                    jogador.decisaoTurno = 2;
                    msg.react('✅');
                    break;
            }

            // Itens
            if (jogador.itemTurno === 0) {
                switch (msg.content) {
                    case `${config.prefixo}pp`:
                        if (jogador.pocaoPequena > 0) {
                            jogador.pocaoPequena--;
                            jogador.hp += 3;

                            if (jogador.hp > jogador.hpTotal) {
                                jogador.hp = jogador.hpTotal;
                            }

                            let embed = new Discord.MessageEmbed()
                                .setColor('#76ab1e')
                                .setDescription(`Você usou uma poção pequena.\n**HP**: ${jogador.hp}/${jogador.hpTotal}`)
                                .setFooter(`Restante no inventário: x${jogador.pocaoPequena}`, config.imagemFooterMensagem);
                            enviarMensagem(embed, jogador.canal);

                            jogador.itemTurno = 1;
                        } else {
                            msg.react('❌');
                        }
                        break;

                    case `${config.prefixo}pm`:
                        if (jogador.pocaoMedia > 0) {
                            jogador.pocaoMedia--;
                            jogador.hp += 8;

                            if (jogador.hp > jogador.hpTotal) {
                                jogador.hp = jogador.hpTotal;
                            }

                            let embed = new Discord.MessageEmbed()
                                .setColor('#76ab1e')
                                .setDescription(`Você usou uma poção média.\n**HP**: ${jogador.hp}/${jogador.hpTotal}`)
                                .setFooter(`Restante no inventário: x${jogador.pocaoMedia}`, config.imagemFooterMensagem);
                            enviarMensagem(embed, jogador.canal);

                            jogador.itemTurno = 1;
                        } else {
                            msg.react('❌');
                        }
                        break;

                    case `${config.prefixo}pg`:
                        if (jogador.pocaoGrande > 0) {
                            jogador.pocaoGrande--;
                            jogador.hp += 18;

                            if (jogador.hp > jogador.hpTotal) {
                                jogador.hp = jogador.hpTotal;
                            }

                            let embed = new Discord.MessageEmbed()
                                .setColor('#76ab1e')
                                .setDescription(`Você usou uma poção grande.\n**HP**: ${jogador.hp}/${jogador.hpTotal}`)
                                .setFooter(`Restante no inventário: x${jogador.pocaoGrande}`, config.imagemFooterMensagem);
                            enviarMensagem(embed, jogador.canal);

                            jogador.itemTurno = 1;
                        } else {
                            msg.react('❌');
                        }
                        break;

                    case `${config.prefixo}ba`:
                        if (bencoes.aco === jogador.usuario.id && turnosRestantesAco === 5) {
                            turnosRestantesAco--;

                            let embed = new Discord.MessageEmbed()
                                .setColor('#a705d3')
                                .setDescription('A bênção do aço foi ativada.\n**Você sente a resistência de Deivid correndo por sua pele.**');
                            enviarMensagem(embed, jogador.canal);

                            jogador.itemTurno = 2;
                        } else {
                            msg.react('❌');
                        }
                        break;
                }
            }
        } else {
            msg.react('❌');
        }

        // Avançar turno se todos os jogadores já atacaram ou defenderam
        if (jogadores.length === jogadores.filter(e => e.decisaoTurno !== 0).length) {
            clearTimeout(timer);
            avancarTurno();
        }

        comandoStats(msg, jogador);
    }
}

function iniciarFaseBatalha() {
    fase = 2; // A fase é alterada somente depois de um tempo para não permitir os comandos da batalha antes
    turno = 0;
    novoTurnoBatalha();
}

function novoTurnoBatalha() {
    turno++;

    console.log(`${turno}/${turnoMaxBatalha} Próximo turno de batalha`);

    let mensagemTurno = aplicarEfeitosTurno();
    mostrarMensagemBatalha(mensagemTurno);
    conferirFimDeJogo();

    if (jogadores.length > 1) {
        // Jogo prossegue
        // Resetar as escolhas dos jogadores
        jogadores.forEach(jogador => {
            jogador.decisaoTurno = 0;
            jogador.itemTurno = 0;
        })

        // Timer para avançar o turno
        tempoTurno = 10;

        jogadores.forEach(jogador => {
            enviarMensagem(`**Digite o que você vai fazer**\nPróximo turno automaticamente em ${tempoTurno} segundos`, jogador.canal);
        });

        timer = setTimeout(function () { avancarTurno() }, tempoTurno * 1000);
    } else {
        // Fim de jogo
        if (jogadores.length === 1) {
            // Um jogador vivo (vitória)
            enviarMensagem('Você venceu!', jogadores[0].canal);
        } else {
            // Todos morreram -> não envia mensagem de vitória
        }

        reiniciar();
    }
}

function aplicarEfeitosTurno() {
    //////////////////////////////////////////////////////////////////////////
    // APLICA EFEITOS RECEBIDOS POR CADA JOGADOR E GERA A MENSAGEM DO TURNO //
    //////////////////////////////////////////////////////////////////////////
    let mensagemTurno = '';

    if (turno !== 1) { // Não aplicar os efeitos quando ninguém ainda fez decisões
        jogadores.forEach(jogador => {
            let danoAplicado = 0, danoDefendido = 0, danoRecebido = 0, danoMortal = 0;

            mensagemTurno += `\nO jogador <@${jogador.usuario.id}> `;

            // Mensagem do item do jogador
            if (jogador.itemTurno === 1) {
                mensagemTurno += 'usou uma poção e ';
            }

            // Ver coisas que o jogador aplicou

            // Defesa base
            danoDefendido = jogador.def / 2;
            // Benção do escudo (boost de defesa)
            if (bencoes.escudo === jogador.usuario.id) {
                danoDefendido = Math.round(danoDefendido * 1.5 * 100) / 100;
            }

            switch (jogador.decisaoTurno) {
                case 1:
                    // Ataque
                    danoAplicado = jogador.atk;

                    // Benção da lâmina (boost de ataque)
                    if (bencoes.lamina === jogador.usuario.id) {
                        danoAplicado = Math.round(danoAplicado * 1.4 * 100) / 100;
                    }

                    mensagemTurno += `atacou (${danoAplicado})`;
                    break;

                case 2:
                    // Defesa
                    danoDefendido = jogador.def;
                    // Benção do escudo (boost de defesa)
                    if (bencoes.escudo === jogador.usuario.id) {
                        danoDefendido = Math.round(danoDefendido * 1.5 * 100) / 100;
                    }

                    mensagemTurno += `defendeu (${danoDefendido})`;
                    break;

                default:
                    // Nada
                    mensagemTurno += 'não usou habilidade';
                    break;
            }

            // Calcular dano que o jogador recebeu dos outros
            jogadores.forEach(e => {
                if (e.usuario.id !== jogador.usuario.id) {

                    if (e.decisaoTurno === 1) {
                        // Inimigo atacou
                        let atkInimigo = e.atk;

                        // Benção da lâmina do inimigo
                        if (bencoes.lamina === e.usuario.id) {
                            atkInimigo *= 1.4;
                        }
                        // Benção da morte do inimigo
                        if (bencoes.morte === e.usuario.id) {
                            danoMortal += atkInimigo * 0.2;
                        }

                        danoRecebido += Math.round(atkInimigo * 100) / 100;
                    }
                }

            });

            // Aplicar dano recebido
            danoRecebido -= danoDefendido;
            danoMortal -= danoDefendido;

            if (danoRecebido < 0) {
                danoRecebido = 0;
            } else {
                danoRecebido = Math.round(danoRecebido * 100) / 100; // Arredondar

                // Benção do aço
                if (bencoes.aco === jogador.usuario.id && turnosRestantesAco >= 0 && turnosRestantesAco < 5) {
                    danoRecebido = 0;
                    danoMortal = 0;
                }

                jogador.hp -= danoRecebido;

                mensagemTurno += `,  perdendo ${danoRecebido} HP`;
            }

            if (danoMortal < 0) {
                danoMortal = 0;
            } else {
                jogador.hpTotal -= danoMortal;
            }

            // Benção do sangue (regeneração)
            if (bencoes.sangue === jogador.usuario.id && jogador.hp > 0) {
                let hpRegenerado = (jogador.pocaoPequena * 3 + jogador.pocaoMedia * 8 + jogador.pocaoGrande * 18) * 0.1;
                jogador.hp += hpRegenerado;

                if (jogador.hp > jogador.hpTotal) {
                    jogador.hp = jogador.hpTotal;
                }
            }

            // Benção das cinzas (trazer de volta à vida)
            if (bencoes.cinzas === jogador.usuario.id && jogador.hp <= 0) {
                jogador.hp = 5;
                mensagemTurno += `\n🔥 **<@${jogador.usuario.id}> retorna das cinzas** 🔥`;
                bencoes.cinzas = 0;
            }
        });
    }

    // Diminuir turnos restantes da benção do aço
    if (turnosRestantesAco !== 5) {
        turnosRestantesAco--;

        if (turnosRestantesAco <= 0) {
            bencoes.aco = 0;
            turnosRestantesAco = 5;
        }
    }

    return mensagemTurno;
}

function mostrarMensagemBatalha(mensagemTurno) {
    let embedBatalha = new Discord.MessageEmbed()
        .setColor('#f7a000')
        .setTitle(`BATALHA (turno ${turno}/${turnoMaxBatalha})`);

    // Adicionar a informação de cada jogador
    jogadores.forEach(jogador => {
        embedBatalha.addField('\u200B', `<@${jogador.usuario.id}>`, false)
            .addField('HP', `${(Math.round(jogador.hp * 100) / 100)}/${(Math.round(jogador.hpTotal * 100) / 100)}`, true)
            .addField(`ATAQUE (${config.prefixo}atk)`, `${jogador.atk}`, true)
            .addField(`DEFESA (${config.prefixo}def)`, `${jogador.def}`, true);
    });

    // Mensagem do turno (o que cada um aplicou e benções)
    if (mensagemTurno !== '') {
        embedBatalha.addField('\u200B\u200B', mensagemTurno, false);
    }

    jogadores.forEach(jogador => {
        // Mensagem do inventário
        let embedInventario = new Discord.MessageEmbed()
            .setColor('#8f5c2f')
            .setDescription(`Seu inventário`);

        if (jogador.pocaoPequena > 0) embedInventario.addField(`Poção pequena (+3 HP, ${config.prefixo}pp)`, `x${jogador.pocaoPequena}`, true);
        if (jogador.pocaoMedia > 0) embedInventario.addField(`Poção média (+8 HP, ${config.prefixo}pm)`, `x${jogador.pocaoMedia}`, true);
        if (jogador.pocaoGrande > 0) embedInventario.addField(`Poção grande (+18 HP, ${config.prefixo}pg)`, `x${jogador.pocaoGrande}`, true);

        if (bencoes.cinzas === jogador.usuario.id) embedInventario.addField('Bênção das cinzas', `Ao morrer, o jogador revive uma vez a partir de suas cinzas.`, true);
        if (bencoes.lamina === jogador.usuario.id) embedInventario.addField('Bênção da lâmina', `Todo ataque causa 40% a mais de dano.`, true);
        if (bencoes.escudo === jogador.usuario.id) embedInventario.addField('Bênção do escudo', `Os ataques recebidos terão 50% a mais da defesa atual absorvida.`, true);
        if (bencoes.sangue === jogador.usuario.id) embedInventario.addField('Bênção do sangue', `A cada turno, o HP é regenerado o equivalente a 10% de todas as poções no inventário.`, true);
        if (bencoes.morte === jogador.usuario.id) embedInventario.addField('Bênção da morte', `20% do dano passa a ser aplicado no HP máximo dos oponentes.`, true);
        if (bencoes.aco === jogador.usuario.id) embedInventario.addField(`Bênção do aço (${config.prefixo}ba)`, `O jogador fica imune a qualquer tipo de dano durante 5 rodadas após ativada.`, true);

        // Enviar embed da batalha e do inventário para cada jogador
        enviarMensagem(embedBatalha, jogador.canal);
        enviarMensagem(embedInventario, jogador.canal);
    });
}

function conferirFimDeJogo() {
    jogadores.forEach(jogador => {
        if (jogador.hp <= 0) {
            // Jogador morreu
            console.log(`${jogador.usuario.id} morreu`);
            enviarMensagem('Você morreu.', jogador.canal);

            // Remover cargos de jogador e dar cargo de espectador
            cargosJogadores.forEach(cargo => {
                jogador.usuario.roles.remove(cargo);
            });
            jogador.usuario.roles.add(cargoEspectador);

            // Remover da lista de jogadores
            jogadores = jogadores.filter(e => e.usuario.id !== jogador.usuario.id);
        }
    });
}

client.login(config.token);