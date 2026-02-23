import React, { useContext, useEffect, useState, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
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
    stageRef,
    getPreviewDimensions
  } = useContext(CanvasContext);

  const containerRef = useRef(null);
  const [stageScale, setStageScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  

  const currentSize = getPreviewDimensions();

  
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      
      const scaleX = containerWidth / currentSize.width;
      const scaleY = containerHeight / currentSize.height;
      
  
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setStageScale(newScale);
      setStageSize({
        width: currentSize.width * newScale,
        height: currentSize.height * newScale
      });
    };

    updateScale();
    
    
    const timeoutId = setTimeout(updateScale, 100);
    
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timeoutId);
    };
  }, [currentSize]);

  const handleElementUpdate = (id, newAttrs) => {
    setElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...newAttrs } : el)
    );
  };

  const safeElements = Array.isArray(elements) ? elements : [];

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-[#f1f5f9]"
      style={{ minHeight: '400px' }}
    >
      <div 
        className="relative shadow-2xl rounded-xl overflow-hidden"
        style={{ 
          width: stageSize.width,
          height: stageSize.height,
        }}
      >
        <Stage
          ref={stageRef}
          width={currentSize.width}
          height={currentSize.height}
          scaleX={stageScale}
          scaleY={stageScale}
          onClick={(e) => {
            if (e.target === e.target.getStage()) {
              setSelectedId(null);
            }
          }}
          onTap={(e) => {
            if (e.target === e.target.getStage()) {
              setSelectedId(null);
            }
          }}
        >
          <Layer>
          
            <Rect
              width={currentSize.width}
              height={currentSize.height}
              fill={canvasBg || '#ffffff'}
              listening={false}
            />
            
            {safeElements.map((el) => {
              if (!el || !el.type) return null;
              
              try {
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
              } catch (err) {
                console.error('Error rendering element:', err);
                return null;
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