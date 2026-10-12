# Como editar os projetos

Cada projeto agora possui um arquivo JSON próprio em `content/projects/`. O site lê primeiro `content/projects/index.json`, depois carrega os arquivos listados ali.

## Adicionar um projeto

1. Crie um novo arquivo, por exemplo `content/projects/novo-projeto.json`.
2. Preencha os campos do modelo abaixo.
3. Adicione `"novo-projeto"` ao array `projects` em `content/projects/index.json`.
4. Coloque as imagens do projeto em `assets/Projects/` e use os caminhos relativos no JSON.

```json
{
  "id": "novo-projeto",
  "title": "Nome do projeto",
  "subtitle": "Resumo curto para o card",
  "category": "Front-End",
  "cover": "assets/Projects/novo-projeto-home.png",
  "images": [
    "assets/Projects/novo-projeto-home.png",
    "assets/Projects/novo-projeto-dashboard.png"
  ],
  "description": "Descrição completa do projeto.",
  "technologies": ["React", "TypeScript"],
  "liveUrl": "https://exemplo.com",
  "githubUrl": "https://github.com/usuario/repositorio"
}
```

## Alterar ou substituir

Para substituir um projeto, altere o JSON correspondente mantendo o mesmo `id`, ou remova o id do índice e cadastre outro. A ordem do array em `index.json` define a ordem dos cards; o primeiro projeto é o destaque principal.

O campo `cover` é a imagem exibida no card e no topo do case. O campo `images` alimenta a galeria do modal e da página `projeto.html?id=...`. Se o projeto não tiver galeria, deixe `images` como `[]`; nesse caso, o `cover` continua sendo usado.

As URLs `liveUrl` e `githubUrl` são opcionais. Se ficarem vazias, os botões correspondentes não aparecem.

## Estrutura

```text
content/
└── projects/
    ├── index.json
    ├── meu-caderno.json
    ├── mercantil-app.json
    ├── cine-react.json
    └── dev-burguer.json
```

A pasta `public/` é a saída estática usada pela configuração do Webdev. Depois de editar os arquivos da raiz, sincronize a mesma estrutura para `public/` antes de publicar.
