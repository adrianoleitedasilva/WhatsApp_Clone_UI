# WhatsApp Clone UI

Um clone da interface do WhatsApp Web, construído apenas com HTML, CSS e JavaScript puro (sem frameworks, sem backend). Todos os contatos e mensagens são dados simulados definidos em [js/data.js](js/data.js), usados apenas para demonstrar a interface.

## Funcionalidades

- Lista de conversas com busca por nome
- Filtros: Todas, Não lidas, Favoritas, Grupos
- Conversas fixadas, com contador de não lidas e indicador online
- Tela de conversa com histórico de mensagens e status de envio (enviado/entregue/lido)
- Indicador de "digitando..."
- Seletor de emojis no composer
- Alternância entre tema claro e escuro (com preferência salva em `localStorage`)
- Layout responsivo (lista/conversa) para uso em telas menores

## Estrutura do projeto

```
├── index.html       # Estrutura da página
├── css/
│   └── style.css    # Estilos e temas (claro/escuro)
├── js/
│   ├── data.js       # Contatos e mensagens simulados
│   └── app.js        # Lógica de renderização e interação
└── assets/           # Imagens/ícones (se houver)
```

## Como rodar

Basta abrir o arquivo `index.html` diretamente no navegador, ou servir a pasta com um servidor estático simples:

```bash
npx serve .
```

## Aviso

Este projeto é apenas uma simulação de interface para fins de estudo/portfólio. Não há envio real de mensagens, backend ou persistência de dados além do tema selecionado.
