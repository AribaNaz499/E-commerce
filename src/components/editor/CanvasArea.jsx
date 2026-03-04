import React, { useContext, useRef, useEffect } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import { CanvasContext } from "../../context/CanvasContext";
import URLImage from "../../canvas/URLImage";
import EditableText from "../../canvas/EditableText";
import CanvasVideo from "../../canvas/CanvasVideo";
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer";

const CanvasArea = ({ elements: propElements }) => {
  const context = useContext(CanvasContext);
  if (!context) return null;

  const { 
    elements: contextElements, 
    selectedId, 
    setSelectedId, 
    handleElementUpdate, 
    canvasBg, 
    orientation, 
    stageRef,
    isPlaying,
    setIsPlaying 
  } = context;

  const activeElements = propElements || contextElements || [];
  const trRef = useRef();

  const canvasDimensions = { 
    portrait: { width: 400, height: 550 }, 
    landscape: { width: 700, height: 450 } 
  };
  
  const currentSize = canvasDimensions[orientation] || canvasDimensions.portrait;

  useEffect(() => {
    if (trRef.current && stageRef.current) {
      if (selectedId) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`);
        if (selectedNode) {
          trRef.current.nodes([selectedNode]);
          trRef.current.getLayer().batchDraw();
        } else {
          trRef.current.nodes([]);
        }
      } else {
        trRef.current.nodes([]);
      }
    }
  }, [selectedId, activeElements]);

  return (
    <div 
      className="flex items-center justify-center bg-white shadow-inner"
      style={{ width: currentSize.width, height: currentSize.height }}
    >
      <Stage 
        ref={stageRef} 
        width={currentSize.width} 
        height={currentSize.height} 
        key={canvasBg} 
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) setSelectedId(null);
        }}
      >
        <Layer>
          
          <Rect 
            x={0} 
            y={0} 
            width={currentSize.width} 
            height={currentSize.height} 
            fill={canvasBg || "#ffffff"} 
            listening={false}
          />

          {activeElements.length > 0 ? (
            activeElements.map((el) => {
              if (!el) return null;
              
              const commonProps = {
                el: el,
                isSelected: selectedId === el.id,
                onSelect: () => setSelectedId(el.id),
                onChange: (attr) => handleElementUpdate(el.id, attr),
              };

              if (el.type === "text") return <EditableText key={el.id} {...commonProps} />;
              if (el.type === "image") return <URLImage key={el.id} {...commonProps} />;
              if (el.type === "video") return <CanvasVideo key={el.id} {...commonProps} />;
              if (el.type === "audio") return (
                <CanvasAudioPlayer 
                  key={el.id}
                  {...commonProps}
                  audioData={el}
                  isPlaying={isPlaying} 
                  onTogglePlay={() => setIsPlaying(!isPlaying)} 
                />
              );
              return null;
            })
          ) : (
            <Rect 
              x={10} 
              y={10} 
              width={currentSize.width - 20} 
              height={currentSize.height - 20} 
              fill="transparent" 
              stroke="#cbd5e1" 
              strokeWidth={2} 
              dash={[5, 5]} 
              cornerRadius={8} 
            />
          )}
          <Transformer 
            ref={trRef} 
            keepRatio={true} 
            rotateEnabled={true} 
            anchorFill="#ffffff" 
            anchorStroke="#3b82f6" 
            anchorSize={8} 
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasArea;