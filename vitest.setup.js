import 'vitest-canvas-mock';
import Konva from 'konva';

// Konva deve detectar automaticamente o ambiente jsdom, 
// mas se forçado para false ele tentará carregar o módulo 'canvas' do Node.

// Mock matchMedia para o jsdom (necessário para SweetAlert2 e outros)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
