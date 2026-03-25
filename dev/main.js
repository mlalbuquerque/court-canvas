import * as CourtCanvasLib from '../src/index.js';

window.CourtCanvasLib = CourtCanvasLib;

document.addEventListener('DOMContentLoaded', () => {
  const containerId = 'app';
  
  // Initialize instance purely (toolbar renders natively!)
  const court = new CourtCanvasLib.CourtCanvas(containerId, {
    width: 800,
    height: 500,
    customTools: [
      { 
          id: 'ball', 
          type: 'stamp', 
          icon: '⚽', 
          image: '⚽',
          label: 'Bola de Futebol'
      },
      {
          id: 'custom-player',
          type: 'player',
          icon: '👤',
          image: '👤', // Usando emoji diretamente como avatar
          label: 'Jogador Especial',
          numberPosition: 'bottom-right'
      }
    ],
    toolbar: {
       visible: true,
       position: 'bottom', // top, bottom
       buttons: ['select', 'player-a', 'player-b', 'custom-player', 'ball', 'arrow', 'ellipse', 'clear', 'export-png']
    }
  });

  window.courtInstance = court; // Export for console debugging
  console.log('Court Canvas successfully loaded!', court);
});
