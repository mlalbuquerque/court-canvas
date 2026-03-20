# Court Canvas ⚽️
Uma biblioteca **agnóstica, modular e focada na renderização vetorial** (2D) de pranchetas táticas esportivas baseada em *Konva.js*.

O **Court Canvas** permite criar rapidamente um campo de futebol interativo onde você pode arrastar jogadores, desenhar marcações geométricas (retângulos, elipses, setas directionais) e, mais importante, **serializar e extrair** esse estado para JSON e Imagens (.png) para salvar tudo num banco de dados.

## ✨ Funcionalidades (O que o Motor Faz?)
- 🏟️ **Design Preciso:** Background matemático renderizando grandes e pequenas áreas perfeitamente dimensionadas.
- 🖐 **Interatividade Completa (Drag & Drop):** Padrão *State* nas ferramentas (clique e arraste jogadores para construir a tática).
- 🧱 **Bounding Box Auto-Ajustável:** Suas peças de xadrez não saem para fora da linha do campo; algoritmos matemáticos seguram os elementos nas bordas corretas!
- 🎨 **Customização Nativa:** A Toolbar possui seletores automáticos de cor da engine. Modifique a cor da equipe, estilos e passes perfeitamente na barra!
- ⏪ **Viajante do Tempo:** Histórico de Estado 100% autônomo. Botões e Teclas de Atalho (`CTRL+Z` e `CTRL+Y`) suportados para desfazer e refazer marcações.
- 📸 **Exportação Rica:** Salve sua tática em `JSON` para carregar num backend, ou renderize perfeitamente uma imagem em HQ (`.png`) da tática em um instante.
- ✨ **Popups UI Modernos:** Prompts de renomeação de jogadores (`dblclick`) e caixas de ajuda alimentadas pelo `SweetAlert2` nativamente.
- ⚛️ **Integração Agnóstica:** Pode ser executado em *Vanilla JS*, *ReactJS* ou *VueJS*.

---

## 🚀 Instalação e Desenvolvimento
Esta biblioteca foi construída isoladamente no modo *Library Mode* do Vite.

1. Navegue até a pasta interna do pacote:


2. Instale as dependências (Engine + DevPlugins):
```bash
npm install
```

3. Inicie o Servidor Vanilla de testes visual:
```bash
npm run dev
# localhost:5173
```

---

## 💻 Exemplos de Uso (Demos)

> 💡 **Nota Importante:** Caso você queira ver um exemplo visual real, dinâmico e 100% funcional imediatamente após fazer o clone do pacote, basta abrir a pasta interna `dev/` do repositório! Ali nós mantemos um `index.html` e um `main.js` totalmente imersos na biblioteca Vanilla. Basta rodar o comando `npm run dev`.

Você não precisa reescrever o motor para migrar de Tech-Stack. O Court Canvas se molda aos Wrappers oficiais.

### 1. Vanilla JavaScript (O HTML puro)
```html
<div id="meu-campo"></div>
<script type="module">
  import { CourtCanvas } from 'court-canvas';

  // Pronto! A Toolbar com os botões surge automaticamente ligada ao motor!
  const court = new CourtCanvas('meu-campo', { 
     width: 800, 
     height: 500,
     toolbar: {
        visible: true,
        position: 'bottom',
        buttons: ['select', 'player-a', 'player-b', 'arrow', 'rect', 'ellipse', 'undo', 'redo', 'clear', 'export-png', 'export-json', 'help']
     }
  });
</script>
```

### 2. Em Projetos ReactJS (`.jsx`)
O pacote expõe um componente inteligente (wrapper) de carregamento em React.

```jsx
import React from 'react';
import { CourtCanvasReact } from 'court-canvas';

const AppTatica = () => {
   return (
      <CourtCanvasReact 
          width={800} 
          height={500}
          // A Toolbar nativa resolve tudo visualmente
          toolbar={{ position: 'top' }} 
      />
   );
};

export default AppTatica;
```

### 3. Em Projetos VueJS 3 (`.vue`)
Em Vue, importamos o `.vue` puro da library:

```vue
<template>
  <main>
    <CourtCanvasVue :width="800" :toolbar="{ position: 'bottom' }" />
  </main>
</template>

<script setup>
import { CourtCanvasVue } from 'court-canvas';
</script>
```

---

## 🧪 Testes
O projeto utiliza uma estratégia de testes em duas camadas para garantir a estabilidade do motor e das integrações:

### 1. Testes Unitários (Vitest)
Focados na lógica do `StateManager`, `Exporters` e comportamento das ferramentas (`Tools`). Utiliza `jsdom` e `vitest-canvas-mock` para simular o ambiente de browser.

```bash
# Rodar todos os testes unitários
npm run test

# Rodar testes com relatório de cobertura (coverage)
npm run test:coverage
```

### 2. Testes de Ponta a Ponta (Playwright)
Validam o fluxo completo do usuário (Happy Path) interagindo com a prancheta real no navegador.

```bash
# Executar os testes E2E (Headless)
npm run test:e2e

# Abrir a interface visual do Playwright para depuração
npx playwright test --ui
```

---

## 🛠 Arquitetura do Pacote
Desenvolvimento Modular via *Monorepo*:

* `src/core/`: Abriga o núcleo algorítmico agnóstico focado inteiramente no *Konva.js* original. Manipulação e Delegação de click.
* `src/core/Tools/`: Padrão state e UI Interactivity (*PlayerTool*, *ArrowTool*, etc).
* `src/core/Exporters/`: Classes isoladas formatadoras (`JsonExporter` e `ImageExporter`).
* `src/react/` e `src/vue/`: Frameworks UI Wrappers encapsulando o construtor lógico e lidando com vazamento de memória e Unmounting de componentes nativamente.
