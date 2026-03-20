export default class ImageExporter {
  constructor(courtCanvas) {
    this.court = courtCanvas;
  }

  exportBase64(pixelRatio = 2) {
    // Escondemos o transformer para nÃ£o aparecer no print da tÃ¡tica
    const transformerWasVisible = this.court.transformer.visible();
    this.court.transformer.hide();
    
    // Convertemos o palco inteiro
    const dataURL = this.court.stage.toDataURL({
      pixelRatio: pixelRatio, // Maior pixelRatio garante SVG/Nitidez retina
      mimeType: 'image/png',
      quality: 1
    });

    // Revertemos a visibilidade
    if (transformerWasVisible) {
      this.court.transformer.show();
    }
    
    return dataURL;
  }

  downloadImage(filename = 'tatica.png') {
    const dataURL = this.exportBase64();
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
