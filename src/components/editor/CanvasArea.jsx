import React, { useContext, useEffect, useRef } from "react";
import { Stage, Layer, Transformer } from "react-konva";

import { CanvasContext } from '../../context/CanvasContext';
import CanvasAudioPlayer from "../../canvas/CanvasAudioPlayer";
import CanvasQRCode from "../../canvas/CanvasQRCode";
import EditableText from "../../canvas/EditableText";
import URLImage from "../../canvas/URLImage";
import CanvasVideo from "../../canvas/CanvasVideo";

const CanvasArea = () => {
  const {
    elements, selectedId, setSelectedId, isPlaying, setIsPlaying,
    canvasBg, orientation, stageRef, audioFile, handleElementUpdate
  } = useContext(CanvasContext);

  const trRef = useRef(null);
  const audioTagRef = useRef(null);

  
  const canvasDimensions = { 
    portrait: { width: 400, height: 500 }, 
    landscape: { width: 500, height: 350 } 
  };
  const currentSize = canvasDimensions[orientation] || canvasDimensions.portrait;

  useEffect(() => {
    if (trRef.current && stageRef.current) {
      if (selectedId) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`);
        const selectedElement = elements.find(el => el.id === selectedId);
        if (selectedNode && selectedElement && selectedElement.type !== 'image') {
          trRef.current.nodes([selectedNode]);
          trRef.current.getLayer().batchDraw();
        } else {
          trRef.current.nodes([]);
        }
      } else {
        trRef.current.nodes([]);
      }
    }
  }, [selectedId, elements]);

  useEffect(() => {
    if (audioTagRef.current && audioFile) {
      if (isPlaying) audioTagRef.current.play().catch(e => console.log(e));
      else audioTagRef.current.pause();
    }
  }, [isPlaying, audioFile]);

  return (
    <div className="flex items-center justify-center bg-white shadow-inner" 
         style={{ width: currentSize.width, height: currentSize.height, backgroundColor: canvasBg || 'white' }}>
      
      {audioFile && <audio ref={audioTagRef} src={audioFile.url} onEnded={() => setIsPlaying(false)} />}

      <Stage
        ref={stageRef}
        width={currentSize.width} 
        height={currentSize.height}
        onMouseDown={(e) => e.target === e.target.getStage() && setSelectedId(null)}
      >
        <Layer>
          {elements.map((el) => {
            if (el.type === 'text') return <EditableText key={el.id} el={el} isSelected={selectedId === el.id} onSelect={() => setSelectedId(el.id)} onChange={(attr) => handleElementUpdate(el.id, attr)} />;
            if (el.type === 'image') return <URLImage key={el.id} el={el} isSelected={selectedId === el.id} onSelect={() => setSelectedId(el.id)} onChange={(attr) => handleElementUpdate(el.id, attr)} />;
            if (el.type === 'video') return <CanvasVideo key={el.id} el={el} isSelected={selectedId === el.id} onSelect={() => setSelectedId(el.id)} onChange={(attr) => handleElementUpdate(el.id, attr)} />;
            if (el.type === 'audio') return <CanvasAudioPlayer key={el.id} audioData={el} isSelected={selectedId === el.id} onSelect={() => setSelectedId(el.id)} onChange={(attr) => handleElementUpdate(el.id, attr)} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)} />;
            if (el.type === 'qrcode') return <CanvasQRCode key={el.id} el={el} isSelected={selectedId === el.id} onSelect={() => setSelectedId(el.id)} onChange={(attr) => handleElementUpdate(el.id, attr)} />;
            return null;
          })}

          <Transformer 
            ref={trRef} 
            keepRatio={true} 
            rotateEnabled={true}
            anchorSize={8}
            anchorFill="#ffffff"
            anchorStroke="#3b82f6"
            borderStroke="#3b82f6"
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasArea;