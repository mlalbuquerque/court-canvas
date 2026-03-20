import React, { useEffect, useRef, useState } from 'react';
import CourtCanvas from '../core/CourtCanvas.js';
import JsonExporter from '../core/Exporters/JsonExporter.js';
import ImageExporter from '../core/Exporters/ImageExporter.js';

const CourtCanvasReact = ({ 
  width = 800, 
  height = 500, 
  backgroundColor = '#2ecc71', 
  lineColor = '#ffffff',
  onCanvasReady = null
}) => {
  const containerRef = useRef(null);
  const [courtInstance, setCourtInstance] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Garante ID unico para o konva atachar se tiver multiplas instancias
    const uniqueId = `court-react-${Math.random().toString(36).substr(2, 9)}`;
    containerRef.current.id = uniqueId;

    const court = new CourtCanvas(uniqueId, {
      width,
      height,
      backgroundColor,
      lineColor
    });

    // Anexa as ferramentas exportadoras utilitarias no wrapper
    court.jsonExporter = new JsonExporter(court);
    court.imageExporter = new ImageExporter(court);

    setCourtInstance(court);

    // Passa a ref pro componente parente pra acesso a metodos imperativos (undo, save state, tool, etc)
    if (onCanvasReady) {
      onCanvasReady(court);
    }

    return () => {
      // Limpeza de memoria quando o componente desmonta
      court.stage.destroy();
    };
  }, []); // Run once on mount

  return (
    <div 
      ref={containerRef} 
      className="court-canvas-react-container"
      tabIndex={0}
      style={{ outline: 'none' }}
    />
  );
};

export default CourtCanvasReact;
