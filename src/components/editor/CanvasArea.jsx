import React, { useContext, useEffect, useRef } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import { CanvasContext } from '../../context/CanvasContext.jsx';
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer.jsx";
import EditableText from "../../canvas/EditableText";
import URLImage from "../../canvas/URLImage";
const CanvasArea = () => {
  const { 
    elements, 
    selectedId, 
    setSelectedId,
    audioFile,
    isPlaying,
    setIsPlaying,
    setAudioFile,
    canvasBg,
    setElements,
    orientation,
    stageRef  
  } = useContext(CanvasContext);

  const containerRef = useRef(null);
  const trRef = useRef(null);

  const canvasDimensions = {
    portrait: { width: 400, height: 500 },
    landscape: { width: 500, height: 350 }
  };

  const currentSize = canvasDimensions[orientation] || canvasDimensions.portrait;

  // Layering Logic: Elements ka order change karna
  const moveElement = (direction) => {
    if (!selectedId) return;
    const index = elements.findIndex(el => el.id === selectedId);
    const newElements = [...elements];
    
    if (direction === 'forward' && index < elements.length - 1) {
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
    } else if (direction === 'backward' && index > 0) {
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
    }
    setElements(newElements);
  };

  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId, elements]);

  const handleElementUpdate = (id, newAttrs) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...newAttrs } : el));
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100">

      <div className="relative shadow-2xl rounded-xl overflow-hidden" 
           style={{ width: currentSize.width, height: currentSize.height, backgroundColor: canvasBg || 'white' }}>
        <Stage
          ref={stageRef}
          width={currentSize.width}
          height={currentSize.height}
          onClick={(e) => e.target === e.target.getStage() && setSelectedId(null)}
        >
          <Layer>
            {elements.map((el) => {
              if (el.type === 'text') {
                return (
                  <EditableText
                    key={el.id}
                    el={el}
                    isSelected={selectedId === el.id}
                    onSelect={() => setSelectedId(el.id)}
                    onChange={(newAttrs) => handleElementUpdate(el.id, newAttrs)}
                  />
                );
              }
              if (el.type === 'image') {
                return (
                  <URLImage
                    key={el.id}
                    el={el}
                    isSelected={selectedId === el.id}
                    onSelect={() => setSelectedId(el.id)}
                    onChange={(newAttrs) => handleElementUpdate(el.id, newAttrs)}
                  />
                );
              }
              return null;
            })}

            {audioFile && (
              <CanvasAudioPlayer
                audioData={audioFile}
                isSelected={selectedId === audioFile.id}
                onSelect={() => setSelectedId(audioFile.id)}
                onChange={(updated) => setAudioFile(updated)}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CanvasArea;