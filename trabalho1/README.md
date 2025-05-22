# Aplicativo de Acessibilidade da Orla da Atalaia - Aracaju

Um aplicativo web progressivo (PWA) que mostra locais com recursos de acessibilidade na Orla da Atalaia em Aracaju, Sergipe. Desenvolvido para oferecer total visibilidade e facilidade de uso para pessoas com todos os tipos de deficiência.

![Captura de tela do aplicativo](screenshots/screen1.png)

## Características

- **Mapa Interativo**: Visualize todos os pontos de acessibilidade na Orla da Atalaia
- **Filtros por Tipo**: Encontre facilmente rampas, banheiros acessíveis, estacionamentos, pisos táteis e mais
- **Lista de Locais**: Veja todos os locais acessíveis em formato de lista com detalhes
- **Detalhes Completos**: Informações detalhadas sobre cada local e seus recursos de acessibilidade
- **Como Chegar**: Integração com Google Maps para obter direções até o local desejado
- **Recursos de Acessibilidade**:
  - Alto contraste para pessoas com baixa visão
  - Ajuste de tamanho de fonte
  - Narração por voz (Text-to-Speech)
  - Navegação por teclado
  - Compatibilidade com leitores de tela
  - Etiquetas ARIA para melhor acessibilidade
  - Pular para o conteúdo principal
- **Funciona Offline**: Disponível mesmo sem conexão com a internet
- **Instalável**: Pode ser instalado como um aplicativo em dispositivos móveis e desktops

## Tipos de Acessibilidade Mapeados

- **Rampas de Acesso**: Para cadeirantes e pessoas com mobilidade reduzida
- **Banheiros Acessíveis**: Banheiros adaptados com barras de apoio e espaço adequado
- **Estacionamentos Reservados**: Vagas prioritárias próximas aos pontos de interesse
- **Piso Tátil**: Guias para pessoas com deficiência visual
- **Informações em Braille**: Placas e materiais informativos em Braille
- **Atendimento em Libras**: Locais com atendentes capacitados em Língua Brasileira de Sinais

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet.js para mapas interativos
- Font Awesome para ícones
- Progressive Web App (PWA)
- Service Workers para funcionalidade offline
- Web Speech API para narração por voz

## Como Usar

1. Acesse o aplicativo através de um navegador web
2. Use os botões de acessibilidade no topo para ajustar o contraste, tamanho da fonte ou ativar narração
3. Navegue pelo mapa para ver os pontos de acessibilidade
4. Use os filtros para encontrar tipos específicos de acessibilidade
5. Clique em um marcador no mapa ou em um card na lista para ver detalhes
6. Use o botão "Como Chegar" para obter direções até o local

## Instalação como PWA

O aplicativo pode ser instalado como um Progressive Web App em dispositivos móveis e desktops:

### No Android:
1. Acesse o site no Chrome
2. Toque no banner de instalação ou no menu (três pontos) e selecione "Adicionar à tela inicial"

### No iOS:
1. Acesse o site no Safari
2. Toque no botão de compartilhamento e selecione "Adicionar à Tela de Início"

### No Desktop:
1. Acesse o site no Chrome, Edge ou outro navegador compatível
2. Clique no ícone de instalação na barra de endereço ou no menu do navegador

## Desenvolvimento

### Pré-requisitos
- Um navegador web moderno
- Um editor de código (VS Code, Sublime Text, etc.)
- Conhecimento básico de HTML, CSS e JavaScript

### Configuração Local
1. Clone este repositório
2. Abra o arquivo `index.html` em um navegador
3. Para desenvolvimento completo com funcionalidades PWA, use um servidor local

```bash
# Exemplo usando Python para criar um servidor local
python -m http.server 8000
```

### Estrutura do Projeto
- `index.html` - Estrutura principal do aplicativo
- `styles.css` - Estilos e temas (incluindo modo de alto contraste)
- `script.js` - Funcionalidades JavaScript e lógica do aplicativo
- `service-worker.js` - Service Worker para funcionalidade offline
- `manifest.json` - Configuração do Progressive Web App
- `icons/` - Ícones do aplicativo em vários tamanhos
- `screenshots/` - Capturas de tela do aplicativo

## Contribuição

Contribuições são bem-vindas! Se você tem sugestões para melhorar este aplicativo ou adicionar novos recursos de acessibilidade, sinta-se à vontade para:

1. Abrir uma issue descrevendo sua ideia
2. Enviar um pull request com suas melhorias

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Para mais informações ou sugestões, entre em contato através de [seu-email@exemplo.com].

---

Desenvolvido com ❤️ para promover a inclusão e acessibilidade.
