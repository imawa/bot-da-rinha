<div id="top"></div>

[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<div align="center">

<h3 align="center">Bot da Rinha</h3>

  <p align="center">
    Jogo para o Discord que mistura questões e batalha entre jogadores
    <br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Tabela de Conteúdos</summary>
  <ol>
    <li>
      <a href="#sobre">Sobre</a>
      <ul>
        <li><a href="#tecnologias-utilizadas">Tecnologias utilizadas</a></li>
      </ul>
    </li>
    <li><a href="#instalação">Instalação</a></li>
    <li><a href="#uso">Uso</a></li>
    <li><a href="#licença">Licença</a></li>
    <li><a href="#contato">Contato</a></li>
    <li><a href="#agradecimentos">Agradecimentos</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## Sobre

Este é um jogo que testa seu conhecimento acerca de determinado assunto ao mesmo tempo que te coloca para trocar porrada virtual com seus amigos.

Você pode conferir as regras em [REGRAS.md](https://github.com/imawa/bot-da-rinha/blob/main/REGRAS.md)

O projeto foi originalmente desenvolvido para um trabalho de Engenharia de Software. Por causa disso, as questões padrões são de conteúdos da disciplina. No entanto, você também pode editar os arquivos para personalizar as perguntas:
- `id` pode ter qualquer valor
- `questao` representa o enunciado da pergunta
- `alternativas` são as respostas apresentadas aos jogadores. É possível criar questões com qualquer número de alternativas
- `resposta` representa o índice da resposta correta em `alternativas`
- `dificuldade` define o tempo de resposta da questão (1 = 60 seg., 2 = 120 seg., 3 = 180 seg.)
- `imagem`, quando definido, deve ser um URL direto à imagem

<p align="right">(<a href="#top">voltar ao topo</a>)</p>


### Tecnologias utilizadas

* [discord.js](https://github.com/discordjs/discord.js)

<p align="right">(<a href="#top">voltar ao topo</a>)</p>


<!-- GETTING STARTED -->
## Instalação

1. Clone o repositório
   ```sh
   git clone https://github.com/imawa/bot-da-rinha.git
   ``` 
2. Ative o modo desenvolvedor do Discord em `Configurações → Avançado`
3. Crie um servidor com base [neste modelo](https://discord.new/9tpnWFUVarUq)
4. Abra o `config.json` em algum editor de texto 
5. Cole o id de cada item no lugar correspondente do `config.json`
 - Você pode obter o id do servidor, dos canais e dos cargos clicando com o botão direito em cada um e em Copiar ID
6. Crie uma conta de bot no Discord e adicione ao servidor com todas as permissões
7. Cole o token do bot no lugar correspodente do `config.json`

<p align="right">(<a href="#top">voltar ao topo</a>)</p>


<!-- USAGE EXAMPLES -->
## Uso

1. Inicie o bot
```sh
node index.js
```

_Para instruções de como jogar, confira [REGRAS.md](https://github.com/imawa/bot-da-rinha/blob/main/REGRAS.md)_

<p align="right">(<a href="#top">voltar ao topo</a>)</p>


<!-- LICENSE -->
## Licença

Distribuído sob a Licença MIT. Veja `LICENSE.txt` para mais informações.

<p align="right">(<a href="#top">voltar ao topo</a>)</p>



<!-- CONTACT -->
## Contato

Fabricio Duarte Júnior - fabricio.duarte.jr@gmail.com

<p align="right">(<a href="#top">voltar ao topo</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Agradecimentos

* [Best-README-Template](https://github.com/othneildrew/Best-README-Template/)

<p align="right">(<a href="#top">voltar ao topo</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/imawa/bot-da-rinha.svg?style=for-the-badge
[license-url]: https://github.com/imawa/bot-da-rinha/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/fabricio-duarte-júnior-676601231
