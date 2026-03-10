import React, { useContext, useRef, useEffect, useState } from "react";
import { Stage, Layer, Transformer, Rect } from "react-konva";
import { CanvasContext } from "../../context/CanvasContext";
import URLImage from "../../canvas/URLImage";
import EditableText from "../../canvas/EditableText";
import CanvasVideo from "../../canvas/CanvasVideo";
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer";
import { Lock } from 'lucide-react'; 

const CanvasArea = ({ elements: propElements, orientation: propOrientation , isLocked }) => {
  const context = useContext(CanvasContext);
  if (!context) return null;

  const {
    elements: contextElements,
    selectedId,
    setSelectedId,
    handleElementUpdate,
    canvasBg,
    stageRef,
    isPlaying,
    setIsPlaying,
    orientation: contextOrientation
  } = context;

  const orientation = propOrientation || contextOrientation;
  const activeElements = propElements ?? contextElements ?? [];

  const trRef = useRef();
  const layerRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);

  const canvasDimensions = {
    portrait: { width: 400, height: 550 },
    landscape: { width: 700, height: 450 }
  };

  const currentSize = canvasDimensions[orientation] || canvasDimensions.portrait;

  useEffect(() => {
    if (!stageRef.current) return;
    if (selectedId) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      setSelectedNode(node);
      if (trRef.current && node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else {
      setSelectedNode(null);
      if (trRef.current) trRef.current.nodes([]);
    }
  }, [selectedId, activeElements]);


  const handleDragEnd = (e, id) => {
    // Agar locked hai to drag na hone dein
    if (isLocked) return;
    handleElementUpdate(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (e, id) => {
    if (isLocked) return;
    
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    handleElementUpdate(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const handleStageMouseDown = (e) => {
    if (isLocked) {
      setSelectedId(null);
      return;
    }
    
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  return (
    <div
      className="flex items-center justify-center bg-white shadow-inner transition-all duration-300 relative  ${isLocked ? 'cursor-not-allowed' : ''}" // ✅ relative class add ki
      style={{ width: currentSize.width, height: currentSize.height }}
    >
      <Stage
        ref={stageRef}
        width={currentSize.width}
        height={currentSize.height}
        key={`stage-${orientation}`} 
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
          style={{ cursor: isLocked ? 'not-allowed' : 'default' }}

      >
        <Layer ref={layerRef}>
          <Rect
            x={0} y={0}
            width={currentSize.width}
            height={currentSize.height}
            fill={canvasBg || "#ffffff"}
            listening={false}
          />

          {activeElements.map((el) => {
            if (!el) return null;

            const elementWithLock = {
              ...el,
              isLocked: isLocked || el.isFixed || el.isLogo 
            };

            const commonProps = {
              id: el.id,
              el: elementWithLock, 
              isSelected: selectedId === el.id && !isLocked, 
              onSelect: () => {
                
                if (!isLocked) {
                  setSelectedId(el.id);
                }
              },
              onDragEnd: (e) => handleDragEnd(e, el.id),
              onTransformEnd: (e) => handleTransformEnd(e, el.id),
              onChange: (attr) => {
              
                if (!isLocked) {
                  handleElementUpdate(el.id, attr);
                }
              }
            };

            if (el.type === "audio" || String(el.id).includes("audio")) {
              return (
                <CanvasAudioPlayer
                  key={el.id}
                  {...commonProps}
                  audioData={el}
                  isPlaying={isPlaying}
                  onTogglePlay={() => !isLocked && setIsPlaying(!isPlaying)} 
                />
              );
            }

            if (el.type === "text") {
              return <EditableText key={el.id} {...commonProps} />;
            }

            if (el.type === "image" || el.type === "qrcode") {
              return <URLImage key={el.id} {...commonProps} />;
            }

            if (el.type === "video") {
              return <CanvasVideo key={el.id} {...commonProps} />;
            }

            return null;
          })}

          {selectedId && !isLocked && (
            <Transformer
              ref={trRef}
              keepRatio={true}
              anchorFill={selectedNode?.getAttr("isCropping") ? "#f59e0b" : "#ffffff"}
              anchorStroke="#3b82f6"
              borderStroke={selectedNode?.getAttr("isCropping") ? "#f59e0b" : "#3b82f6"}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
            />
          )}
        </Layer>
      </Stage>
      
      {isLocked && (
        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 pointer-events-none">
          <Lock size={12} /> Slide Locked
        </div>
      )}
    </div>
  );
};

export default CanvasArea;