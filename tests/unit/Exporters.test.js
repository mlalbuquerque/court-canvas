import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourtCanvas from '../../src/core/CourtCanvas.js';
import JsonExporter from '../../src/core/Exporters/JsonExporter.js';
import ImageExporter from '../../src/core/Exporters/ImageExporter.js';
import Konva from 'konva';

describe('Exporters', () => {
  let court;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    court = new CourtCanvas('app');
  });

  describe('JsonExporter', () => {
    it('deve exportar o estado como string JSON da camada interativa', () => {
      const exporter = new JsonExporter(court);
      const json = exporter.export();
      
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.className).toBe('Layer');
    });

    it('deve importar um estado JSON corretamente', () => {
      const exporter = new JsonExporter(court);
      const json = court.interactiveLayer.toJSON();
      const loadSpy = vi.spyOn(court.stateManager, 'loadState');
      
      exporter.import(json);
      
      expect(loadSpy).toHaveBeenCalledWith(json);
    });
  });

  describe('ImageExporter', () => {
    it('deve chamar toDataURL do stage na exportação base64', () => {
      const exporter = new ImageExporter(court);
      const dataUrlSpy = vi.spyOn(court.stage, 'toDataURL').mockReturnValue('data:image/png;base64,123');
      
      const dataUrl = exporter.exportBase64();
      
      expect(dataUrlSpy).toHaveBeenCalled();
      expect(dataUrl).toBe('data:image/png;base64,123');
    });

    it('deve exportar corretamente mesmo se o transformer já estiver oculto', () => {
      const exporter = new ImageExporter(court);
      court.transformer.hide();
      vi.spyOn(court.stage, 'toDataURL').mockReturnValue('data:image/png;base64,123');
      
      exporter.exportBase64();
      expect(court.transformer.visible()).toBe(false);
    });

    it('deve criar link e clicar para download', () => {
      const exporter = new ImageExporter(court);
      vi.spyOn(court.stage, 'toDataURL').mockReturnValue('data:image/png;base64,123');
      
      const link = { click: vi.fn(), download: '', href: '' };
      vi.spyOn(document, 'createElement').mockReturnValue(link);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
      
      exporter.downloadImage('teste.png');
      
      expect(link.click).toHaveBeenCalled();
      expect(link.download).toBe('teste.png');
    });
  });
});
