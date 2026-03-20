import { CourtCanvas } from '../src/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const containerId = 'app';
  
  // Initialize instance purely (toolbar renders natively!)
  const court = new CourtCanvas(containerId, {
    width: 800,
    height: 500,
    toolbar: {
       visible: true,
       position: 'bottom', // top, bottom
       buttons: ['select', 'player-a', 'player-b', 'arrow', 'rect', 'ellipse', 'undo', 'redo', 'clear', 'export-png', 'export-json', 'help']
    }
  });

  window.courtInstance = court; // Export for console debugging
  console.log('Court Canvas successfully loaded!', court);
});
